package de.luanos.bmsplugin;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpClient.Version;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse.BodyHandlers;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.bukkit.command.CommandExecutor;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

import com.google.gson.Gson;

class StatusRequest {
    String type = "SOL";
    Object[] players;

    public StatusRequest(Object[] players) {
        this.players = players;
    }
}

public final class BMSPlugin extends JavaPlugin {
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    final Runnable statusTask = new Runnable() {
        public void run() {
            Object[] a = getServer().getOnlinePlayers().toArray();
            getLogger().info("Sending request" + a.toString());
            Gson gson = new Gson();
            int res = sendRequest(gson.toJson(new StatusRequest(a)));
            getLogger().info("got response " + res);
        }
    };

    public int sendRequest(String data) {
        String requestUrl = getConfig().getString("url");
        getLogger().info(data);
        // String accessToken = getConfig().getString("accessToken");
        try {
            HttpRequest request = HttpRequest.newBuilder().uri(new URI(requestUrl))
                    .version(Version.HTTP_1_1)
                    .POST(BodyPublishers.ofString(data))
                    .build();
            HttpClient client = HttpClient.newHttpClient();

            HttpResponse<String> res = client.send(request, BodyHandlers.ofString());
            return res.statusCode();
        } catch (Exception e) {
            getLogger().info(e.getMessage());
            return 1337;
        }

    }

    @Override
    public void onEnable() {
        // Config stuff
        FileConfiguration config = getConfig();
        config.options().copyDefaults(true);
        config.addDefault("signOfLifeInterval", 10000);
        saveConfig();

        // Scheduler
        int solInterval = getConfig().getInt("signOfLifeInterval");
        scheduler.scheduleAtFixedRate(statusTask, solInterval, solInterval, TimeUnit.MILLISECONDS);

        getLogger().info("plugin enabled");

    }

    @Override
    public void onDisable() {
        getLogger().info("plugin disabled");
    }

}
