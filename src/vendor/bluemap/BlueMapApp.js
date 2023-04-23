/*
 * This file is part of BlueMap, licensed under the MIT License (MIT).
 *
 * Copyright (c) Blue (Lukas Rieger) <https://bluecolored.de>
 * Copyright (c) contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
import "./BlueMap";
import { FileLoader, MathUtils, Vector3 } from "three";

import { MapViewer } from "./MapViewer";
import { PopupMarker } from "./PopupMarker";
import { getLocalStorage, round, setLocalStorage } from "./Utils";
import { FreeFlightControls } from "./controls/freeflight/FreeFlightControls";
import { MapControls } from "./controls/map/MapControls";
import { Map as BlueMapMap } from "./map/Map";
import { MarkerSet } from "./markers/MarkerSet";
import { PlayerMarkerManager } from "./markers/PlayerMarkerManager";
import {
  alert,
  animate,
  EasingFunctions,
  generateCacheHash,
} from "./util/Utils";
import { i18n, setLanguage } from "../i18n";

export class BlueMapApp {
  /**
   * @param rootElement {Element}
   */
  constructor(rootElement, actionHandler) {
    this.events = rootElement;

    this.mapViewer = new MapViewer(rootElement, this.events);

    this.mapControls = new MapControls(this.mapViewer.renderer.domElement);
    this.freeFlightControls = new FreeFlightControls(
      this.mapViewer.renderer.domElement
    );

    /** @type {PlayerMarkerManager} */
    this.playerMarkerManager = null;

    /** @type {{
     *      version: string,
     *      useCookies: boolean,
     *      enableFreeFlight: boolean,
     *      resolutionDefault: number,
     *      minZoomDistance: number,
     *      maxZoomDistance: number,
     *      hiresSliderMax: number,
     *      hiresSliderDefault: number,
     *      hiresSliderMin: number,
     *      lowresSliderMax: number,
     *      lowresSliderDefault: number,
     *      lowresSliderMin: number,
     *      startLocation: string,
     *      maps: string[],
     *      scripts: string[],
     *      styles: string[]
     *  }}
     **/
    this.settings = null;
    this.savedUserSettings = new Map();

    /** @type BlueMapMap[] */
    this.maps = [];
    /** @type Map<BlueMapMap> */
    this.mapsMap = new Map();

    this.lastCameraMove = 0;

    this.dataUrl = "maps/";

    this.appState = {
      controls: {
        state: "perspective",
        mouseSensitivity: 1,
        showZoomButtons: true,
        invertMouse: false,
        enableFreeFlight: false,
        pauseTileLoading: false,
      },
      maps: [],
      theme: null,
      screenshot: {
        clipboard: true,
      },
      debug: false,
    };

    // init
    this.updateControlsSettings();

    // popup on click
    this.popupMarkerSet = new MarkerSet("bm-popup-set");
    this.popupMarkerSet.data.toggleable = false;
    this.popupMarker = new PopupMarker(
      "bm-popup",
      this.appState,
      this.events,
      actionHandler
    );
    this.popupMarkerSet.add(this.popupMarker);
    this.mapViewer.markers.add(this.popupMarkerSet);

    this.updateLoop = null;

    this.viewAnimation = null;
  }

  /**
   * @returns {Promise<void|never>}
   */
  async load() {
    let oldMaps = this.maps;
    this.maps = [];
    this.appState.maps.splice(0, this.appState.maps.length);
    this.mapsMap.clear();

    // load settings
    await this.getSettings();
    this.mapControls.minDistance = this.settings.minZoomDistance;
    this.mapControls.maxDistance = this.settings.maxZoomDistance;
    this.appState.controls.enableFreeFlight = this.settings.enableFreeFlight;

    // unload loaded maps
    await this.mapViewer.switchMap(null);
    oldMaps.forEach((map) => map.dispose());

    // load maps
    this.maps = await this.loadMaps();
    for (let map of this.maps) {
      this.mapsMap.set(map.data.id, map);
      this.appState.maps.push(map.data);
    }

    // switch to map
    try {
      if (!(await this.loadPageAddress())) {
        if (this.maps.length > 0) await this.switchMap(this.maps[0].data.id);
        this.resetCamera();
      }
    } catch (e) {
      console.error("Failed to load map!", e);
    }

    // map position address
    this.events.addEventListener("bluemapCameraMoved", this.cameraMoved);
    this.events.addEventListener("bluemapMapInteraction", this.mapInteraction);

    // start app update loop
    if (this.updateLoop) clearTimeout(this.updateLoop);
    this.updateLoop = setTimeout(this.update, 1000);

    // load user settings
    await this.loadUserSettings();

    // save user settings
    this.saveUserSettings();

    // load settings-scripts
    if (this.settings.scripts)
      for (let scriptUrl of this.settings.scripts) {
        let scriptElement = document.createElement("script");
        scriptElement.src = scriptUrl;
        document.body.appendChild(scriptElement);
      }
  }

  update = async () => {
    await this.followPlayerMarkerWorld();
    this.updateLoop = setTimeout(this.update, 1000);
  };

  async followPlayerMarkerWorld() {
    /** @type {PlayerLike} */
    let player = this.mapViewer.controlsManager.controls?.data.followingPlayer;

    if (this.mapViewer.map && player) {
      if (player.foreign) {
        let matchingMap = await this.findPlayerMap(player.playerUuid);
        if (matchingMap) {
          await this.switchMap(matchingMap.data.id, false);
          let playerMarker = this.playerMarkerManager.getPlayerMarker(
            player.playerUuid
          );
          if (
            playerMarker &&
            this.mapViewer.controlsManager.controls.followPlayerMarker
          )
            this.mapViewer.controlsManager.controls.followPlayerMarker(
              playerMarker
            );
        } else {
          if (this.mapViewer.controlsManager.controls.stopFollowingPlayerMarker)
            this.mapViewer.controlsManager.controls.stopFollowingPlayerMarker();
        }
      }
    }
  }

  async findPlayerMap(playerUuid) {
    /** @type BlueMapMap */
    let matchingMap = null;

    // search for the map that contains the player
    if (this.maps.length < 20) {
      for (let map of this.maps) {
        let playerData = await this.loadPlayerData(map);
        if (!Array.isArray(playerData.players)) continue;
        for (let p of playerData.players) {
          if (p.uuid === playerUuid && !p.foreign) {
            matchingMap = map;
            break;
          }
        }

        if (matchingMap) break;
      }
    }

    return matchingMap;
  }

  /**
   * @param mapId {String}
   * @param resetCamera {boolean}
   * @returns {Promise<void>}
   */
  async switchMap(mapId, resetCamera = true) {
    let map = this.mapsMap.get(mapId);
    if (!map)
      return Promise.reject(`There is no map with the id "${mapId}" loaded!`);

    await this.mapViewer.switchMap(map);

    if (resetCamera) this.resetCamera();

    await this.initPlayerMarkerManager();
  }

  resetCamera() {
    let map = this.mapViewer.map;
    let controls = this.mapViewer.controlsManager;

    if (map) {
      controls.position.set(map.data.startPos.x, 0, map.data.startPos.z);
      controls.distance = 1500;
      controls.angle = 0;
      controls.rotation = 0;
      controls.tilt = 0;
      controls.ortho = 0;
    }

    controls.controls = this.mapControls;
    this.appState.controls.state = "perspective";
  }

  /**
   * @returns Promise<BlueMapMap[]>
   */
  async loadMaps() {
    let settings = this.settings;
    let maps = [];

    // create maps
    if (settings.maps !== undefined) {
      for (let mapId of settings.maps) {
        let map = new BlueMapMap(
          mapId,
          this.dataUrl + mapId + "/",
          this.loadBlocker,
          this.mapViewer.events
        );
        maps.push(map);

        await map.loadSettings().catch((error) => {
          alert(
            this.events,
            `Failed to load settings for map '${map.data.id}':` + error,
            "warning"
          );
        });
      }
    }

    // sort maps
    maps.sort((map1, map2) => {
      let sort = map1.data.sorting - map2.data.sorting;
      if (isNaN(sort)) return 0;
      return sort;
    });

    return maps;
  }

  async getSettings() {
    if (!this.settings) {
      this.settings = await this.loadSettings();
    }

    return this.settings;
  }

  /**
   * @returns {Promise<Object>}
   */
  loadSettings() {
    return new Promise((resolve, reject) => {
      let loader = new FileLoader();
      loader.setResponseType("json");
      loader.load(
        "settings.json?" + generateCacheHash(),
        resolve,
        () => {},
        () => reject("Failed to load the settings.json!")
      );
    });
  }

  /**
   * @param map {BlueMapMap}
   * @returns {Promise<Object>}
   */
  loadPlayerData(map) {
    return new Promise((resolve, reject) => {
      let loader = new FileLoader();
      loader.setResponseType("json");
      loader.load(
        map.data.dataUrl + "live/players?" + generateCacheHash(),
        (fileData) => {
          if (!fileData) reject(`Failed to parse '${this.fileUrl}'!`);
          else resolve(fileData);
        },
        () => {},
        () => reject(`Failed to load '${this.fileUrl}'!`)
      );
    });
  }

  initPlayerMarkerManager() {
    if (this.playerMarkerManager) {
      this.playerMarkerManager.clear();
      this.playerMarkerManager.dispose();
    }

    const map = this.mapViewer.map;
    if (!map) return;

    this.playerMarkerManager = new PlayerMarkerManager(
      this.mapViewer.markers,
      map.data.dataUrl + "live/players.json",
      map.data.dataUrl + "assets/playerheads/",
      this.events
    );
    this.playerMarkerManager.setAutoUpdateInterval(0);
    return this.playerMarkerManager
      .update()
      .then(() => {
        this.playerMarkerManager.setAutoUpdateInterval(1000);
      })
      .catch((e) => {
        alert(this.events, e, "warning");
        this.playerMarkerManager.clear();
        this.playerMarkerManager.dispose();
      });
  }

  updateControlsSettings() {
    let mouseInvert = this.appState.controls.invertMouse ? -1 : 1;

    this.freeFlightControls.mouseRotate.speedCapture =
      -1.5 * this.appState.controls.mouseSensitivity;
    this.freeFlightControls.mouseAngle.speedCapture =
      -1.5 * this.appState.controls.mouseSensitivity * mouseInvert;
    this.freeFlightControls.mouseRotate.speedRight =
      -2 * this.appState.controls.mouseSensitivity;
    this.freeFlightControls.mouseAngle.speedRight =
      -2 * this.appState.controls.mouseSensitivity * mouseInvert;
  }

  setPerspectiveView(transition = 0, minDistance = 5) {
    if (!this.mapViewer.map) return;
    if (this.viewAnimation) this.viewAnimation.cancel();

    let cm = this.mapViewer.controlsManager;
    cm.controls = null;

    let startDistance = cm.distance;
    let targetDistance = Math.max(5, minDistance, startDistance);

    let startY = cm.position.y;
    let targetY = MathUtils.lerp(
      this.mapViewer.map.terrainHeightAt(cm.position.x, cm.position.z) + 3,
      0,
      targetDistance / 500
    );

    let startAngle = cm.angle;
    let targetAngle = Math.min(
      Math.PI / 2,
      startAngle,
      this.mapControls.getMaxPerspectiveAngleForDistance(targetDistance)
    );

    let startOrtho = cm.ortho;
    let startTilt = cm.tilt;

    this.viewAnimation = animate(
      (p) => {
        let ep = EasingFunctions.easeInOutQuad(p);
        cm.position.y = MathUtils.lerp(startY, targetY, ep);
        cm.distance = MathUtils.lerp(startDistance, targetDistance, ep);
        cm.angle = MathUtils.lerp(startAngle, targetAngle, ep);
        cm.ortho = MathUtils.lerp(startOrtho, 0, p);
        cm.tilt = MathUtils.lerp(startTilt, 0, ep);
      },
      transition,
      (finished) => {
        this.mapControls.reset();
        if (finished) {
          cm.controls = this.mapControls;
        }
      }
    );

    this.appState.controls.state = "perspective";
  }

  setFlatView(transition = 0, minDistance = 5) {
    if (!this.mapViewer.map) return;
    if (this.viewAnimation) this.viewAnimation.cancel();

    let cm = this.mapViewer.controlsManager;
    cm.controls = null;

    let startDistance = cm.distance;
    let targetDistance = Math.max(5, minDistance, startDistance);

    let startRotation = cm.rotation;
    let startAngle = cm.angle;
    let startOrtho = cm.ortho;
    let startTilt = cm.tilt;

    this.viewAnimation = animate(
      (p) => {
        let ep = EasingFunctions.easeInOutQuad(p);
        cm.distance = MathUtils.lerp(startDistance, targetDistance, ep);
        cm.rotation = MathUtils.lerp(startRotation, 0, ep);
        cm.angle = MathUtils.lerp(startAngle, 0, ep);
        cm.ortho = MathUtils.lerp(startOrtho, 1, p);
        cm.tilt = MathUtils.lerp(startTilt, 0, ep);
      },
      transition,
      (finished) => {
        this.mapControls.reset();
        if (finished) {
          cm.controls = this.mapControls;
        }
      }
    );

    this.appState.controls.state = "flat";
  }

  setFreeFlight(transition = 0, targetY = undefined) {
    if (!this.mapViewer.map) return;
    if (!this.settings.enableFreeFlight)
      return this.setPerspectiveView(transition);
    if (this.viewAnimation) this.viewAnimation.cancel();

    let cm = this.mapViewer.controlsManager;
    cm.controls = null;

    let startDistance = cm.distance;

    let startY = cm.position.y;
    if (!targetY)
      targetY =
        this.mapViewer.map.terrainHeightAt(cm.position.x, cm.position.z) + 3 ||
        startY;

    let startAngle = cm.angle;
    let targetAngle = Math.PI / 2;

    let startOrtho = cm.ortho;
    let startTilt = cm.tilt;

    this.viewAnimation = animate(
      (p) => {
        let ep = EasingFunctions.easeInOutQuad(p);
        cm.position.y = MathUtils.lerp(startY, targetY, ep);
        cm.distance = MathUtils.lerp(startDistance, 0, ep);
        cm.angle = MathUtils.lerp(startAngle, targetAngle, ep);
        cm.ortho = MathUtils.lerp(startOrtho, 0, Math.min(p * 2, 1));
        cm.tilt = MathUtils.lerp(startTilt, 0, ep);
      },
      transition,
      (finished) => {
        if (finished) {
          cm.controls = this.freeFlightControls;
        }
      }
    );

    this.appState.controls.state = "free";
  }

  setDebug(debug) {
    this.appState.debug = debug;

    if (debug) {
      this.mapViewer.stats.showPanel(0);
    } else {
      this.mapViewer.stats.showPanel(-1);
    }
  }

  setTheme(theme) {
    this.appState.theme = theme;

    if (theme === "light") {
      this.mapViewer.rootElement.classList.remove("theme-dark");
      this.mapViewer.rootElement.classList.remove("theme-contrast");
      this.mapViewer.rootElement.classList.add("theme-light");
    } else if (theme === "dark") {
      this.mapViewer.rootElement.classList.remove("theme-light");
      this.mapViewer.rootElement.classList.remove("theme-contrast");
      this.mapViewer.rootElement.classList.add("theme-dark");
    } else if (theme === "contrast") {
      this.mapViewer.rootElement.classList.remove("theme-light");
      this.mapViewer.rootElement.classList.remove("theme-dark");
      this.mapViewer.rootElement.classList.add("theme-contrast");
    } else {
      this.mapViewer.rootElement.classList.remove("theme-light");
      this.mapViewer.rootElement.classList.remove("theme-dark");
      this.mapViewer.rootElement.classList.remove("theme-contrast");
    }
  }

  setScreenshotClipboard(clipboard) {
    this.appState.screenshot.clipboard = clipboard;
  }

  async updateMap() {
    try {
      this.mapViewer.clearTileCache();
      if (this.mapViewer.map) {
        await this.switchMap(this.mapViewer.map.data.id);
      }
      this.saveUserSettings();
    } catch (e) {
      alert(this.events, e, "error");
    }
  }

  resetSettings() {
    this.saveUserSetting("resetSettings", true);
    location.reload();
  }

  async loadUserSettings() {
    if (!isNaN(this.settings.resolutionDefault))
      this.mapViewer.data.superSampling = this.settings.resolutionDefault;
    if (!isNaN(this.settings.hiresSliderDefault))
      this.mapViewer.data.loadedHiresViewDistance =
        this.settings.hiresSliderDefault;
    if (!isNaN(this.settings.lowresSliderDefault))
      this.mapViewer.data.loadedLowresViewDistance =
        this.settings.lowresSliderDefault;

    if (!this.settings.useCookies) return;

    if (this.loadUserSetting("resetSettings", false)) {
      alert(this.events, "Settings reset!", "info");
      this.saveUserSettings();
      return;
    }

    this.mapViewer.clearTileCache(
      this.loadUserSetting("tileCacheHash", this.mapViewer.tileCacheHash)
    );

    this.mapViewer.superSampling = this.loadUserSetting(
      "superSampling",
      this.mapViewer.data.superSampling
    );
    this.mapViewer.data.loadedHiresViewDistance = this.loadUserSetting(
      "hiresViewDistance",
      this.mapViewer.data.loadedHiresViewDistance
    );
    this.mapViewer.data.loadedLowresViewDistance = this.loadUserSetting(
      "lowresViewDistance",
      this.mapViewer.data.loadedLowresViewDistance
    );
    this.mapViewer.updateLoadedMapArea();
    this.appState.controls.mouseSensitivity = this.loadUserSetting(
      "mouseSensitivity",
      this.appState.controls.mouseSensitivity
    );
    this.appState.controls.invertMouse = this.loadUserSetting(
      "invertMouse",
      this.appState.controls.invertMouse
    );
    this.appState.controls.pauseTileLoading = this.loadUserSetting(
      "pauseTileLoading",
      this.appState.controls.pauseTileLoading
    );
    this.appState.controls.showZoomButtons = this.loadUserSetting(
      "showZoomButtons",
      this.appState.controls.showZoomButtons
    );
    this.updateControlsSettings();
    this.setTheme(this.loadUserSetting("theme", this.appState.theme));
    this.setScreenshotClipboard(
      this.loadUserSetting(
        "screenshotClipboard",
        this.appState.screenshot.clipboard
      )
    );
    await setLanguage(this.loadUserSetting("lang", i18n.locale.value));
    this.setDebug(this.loadUserSetting("debug", this.appState.debug));

    alert(this.events, "Settings loaded!", "info");
  }

  saveUserSettings() {
    if (!this.settings.useCookies) return;

    this.saveUserSetting("resetSettings", false);
    this.saveUserSetting("tileCacheHash", this.mapViewer.tileCacheHash);

    this.saveUserSetting("superSampling", this.mapViewer.data.superSampling);
    this.saveUserSetting(
      "hiresViewDistance",
      this.mapViewer.data.loadedHiresViewDistance
    );
    this.saveUserSetting(
      "lowresViewDistance",
      this.mapViewer.data.loadedLowresViewDistance
    );
    this.saveUserSetting(
      "mouseSensitivity",
      this.appState.controls.mouseSensitivity
    );
    this.saveUserSetting("invertMouse", this.appState.controls.invertMouse);
    this.saveUserSetting(
      "pauseTileLoading",
      this.appState.controls.pauseTileLoading
    );
    this.saveUserSetting(
      "showZoomButtons",
      this.appState.controls.showZoomButtons
    );
    this.saveUserSetting("theme", this.appState.theme);
    this.saveUserSetting(
      "screenshotClipboard",
      this.appState.screenshot.clipboard
    );
    this.saveUserSetting("lang", i18n.locale.value);
    this.saveUserSetting("debug", this.appState.debug);

    alert(this.events, "Settings saved!", "info");
  }

  loadUserSetting(key, defaultValue) {
    let value = getLocalStorage("bluemap-" + key);

    if (value === undefined) return defaultValue;
    return value;
  }

  saveUserSetting(key, value) {
    if (this.savedUserSettings.get(key) !== value) {
      this.savedUserSettings.set(key, value);
      setLocalStorage("bluemap-" + key, value);
    }
  }

  cameraMoved = () => {};

  loadBlocker = async () => {
    if (!this.appState.controls.pauseTileLoading) return;

    let timeToWait;
    do {
      let timeSinceLastMove = Date.now() - this.lastCameraMove;
      timeToWait = 250 - timeSinceLastMove;
      if (timeToWait > 0) await this.sleep(timeToWait);
    } while (timeToWait > 0);
  };

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  updatePageAddress = () => {
    let hash = "#";

    if (this.mapViewer.map) {
      hash += this.mapViewer.map.data.id;

      let controls = this.mapViewer.controlsManager;
      hash += ":" + round(controls.position.x, 0);
      hash += ":" + round(controls.position.y, 0);
      hash += ":" + round(controls.position.z, 0);
      hash += ":" + round(controls.distance, 0);
      hash += ":" + round(controls.rotation, 2);
      hash += ":" + round(controls.angle, 2);
      hash += ":" + round(controls.tilt, 2);
      hash += ":" + round(controls.ortho, 0);
    }

    history.replaceState(undefined, undefined, hash);
  };

  loadPageAddress = async () => {
    let hash =
      window.location.hash?.substring(1) || this.settings.startLocation || "";
    let values = hash.split(":");

    if (values.length !== 9) return false;

    let controls = this.mapViewer.controlsManager;
    controls.controls = null;

    if (!this.mapViewer.map || this.mapViewer.map.data.id !== values[0]) {
      try {
        await this.switchMap(values[0]);
      } catch (e) {
        return false;
      }
    }
    controls.position.x = parseFloat(values[1]);
    controls.position.y = parseFloat(values[2]);
    controls.position.z = parseFloat(values[3]);
    controls.distance = parseFloat(values[4]);
    controls.rotation = parseFloat(values[5]);
    controls.angle = parseFloat(values[6]);
    controls.tilt = parseFloat(values[7]);
    controls.ortho = parseFloat(values[8]);

    return true;
  };

  mapInteraction = (event) => {
    if (event.detail.data.doubleTap) {
      let cm = this.mapViewer.controlsManager;
      let pos =
        event.detail.hit?.point ||
        event.detail.object?.getWorldPosition(new Vector3());
      if (!pos) return;

      let startDistance = cm.distance;
      let targetDistance = Math.max(startDistance * 0.25, 5);

      let startX = cm.position.x;
      let targetX = pos.x;

      let startZ = cm.position.z;
      let targetZ = pos.z;

      this.viewAnimation = animate((p) => {
        let ep = EasingFunctions.easeInOutQuad(p);
        cm.distance = MathUtils.lerp(startDistance, targetDistance, ep);
        cm.position.x = MathUtils.lerp(startX, targetX, ep);
        cm.position.z = MathUtils.lerp(startZ, targetZ, ep);
      }, 500);
    }
  };
}
