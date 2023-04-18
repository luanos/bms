package de.luanos.bmsplugin;

import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpClient.Version;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse.BodyHandler;
import java.net.http.HttpResponse.BodyHandlers;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.bukkit.command.CommandExecutor;
import org.bukkit.plugin.java.JavaPlugin;

import com.google.gson.Gson;
import com.google.gson.JsonElement;

class SignOfLifeRequest {
    String type = "SOL";
}

public final class BMSPlugin extends JavaPlugin {
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    public int sendRequest(String data) {
        String requestUrl = getConfig().getString("url");
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
            return 1337;
        }

    }

    @Override
    public void onEnable() {
        final Runnable signOfLifeTask = new Runnable() {

            public void run() {
                getLogger().info("Sending request");
                Gson gson = new Gson();
                int res = sendRequest(gson.toJson(new SignOfLifeRequest()));
                getLogger().info("got response " + res);
            }
        };
        int solInterval = getConfig().getInt("signOfLifeInterval");
        scheduler.scheduleAtFixedRate(signOfLifeTask, solInterval, solInterval, TimeUnit.MILLISECONDS);
        CommandExecutor waypointCommand = new Waypoint();

        this.getCommand("waypoint").setExecutor(waypointCommand);
        getLogger().info("onEnable is called");

    }

    @Override
    public void onDisable() {
        getLogger().info("onDisable is called");
    }

}
