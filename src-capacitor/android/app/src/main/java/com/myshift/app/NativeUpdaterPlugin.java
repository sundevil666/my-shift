package com.myshift.app;

import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.provider.Settings;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "NativeUpdater")
public class NativeUpdaterPlugin extends Plugin {
    private static final String BACKUP_KEY = "user_data_backup";
    private static final String PREFERENCES = "my_shift_updates";
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    @PluginMethod
    public void install(PluginCall call) {
        String url = call.getString("url");
        String backup = call.getString("backup");
        if (url == null || backup == null) {
            call.reject("Missing update URL or backup");
            return;
        }

        preferences().edit().putString(BACKUP_KEY, backup).apply();
        executor.execute(() -> downloadAndInstall(url, call));
    }

    @PluginMethod
    public void consumeBackup(PluginCall call) {
        JSObject result = new JSObject();
        result.put("backup", preferences().getString(BACKUP_KEY, null));
        call.resolve(result);
    }

    private void downloadAndInstall(String source, PluginCall call) {
        HttpURLConnection connection = null;
        try {
            File updateDirectory = new File(getContext().getCacheDir(), "updates");
            if (!updateDirectory.exists() && !updateDirectory.mkdirs()) {
                throw new IllegalStateException("Could not create update directory");
            }
            File apk = new File(updateDirectory, "my-shift-update.apk");
            connection = (HttpURLConnection) new URL(source).openConnection();
            connection.setConnectTimeout(20_000);
            connection.setReadTimeout(60_000);
            connection.setInstanceFollowRedirects(true);
            connection.connect();
            if (connection.getResponseCode() < 200 || connection.getResponseCode() >= 300) {
                throw new IllegalStateException("Update download failed");
            }

            try (InputStream input = connection.getInputStream();
                 FileOutputStream output = new FileOutputStream(apk)) {
                byte[] buffer = new byte[16_384];
                int count;
                while ((count = input.read(buffer)) >= 0) {
                    output.write(buffer, 0, count);
                }
            }

            getActivity().runOnUiThread(() -> openInstaller(apk, call));
        } catch (Exception error) {
            call.reject("Could not download update", error);
        } finally {
            if (connection != null) connection.disconnect();
        }
    }

    private void openInstaller(File apk, PluginCall call) {
        if (!getContext().getPackageManager().canRequestPackageInstalls()) {
            Intent settingsIntent = new Intent(
                Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                Uri.parse("package:" + getContext().getPackageName())
            );
            getActivity().startActivity(settingsIntent);
            call.reject("install-permission-required");
            return;
        }

        Uri apkUri = FileProvider.getUriForFile(
            getContext(),
            getContext().getPackageName() + ".fileprovider",
            apk
        );
        Intent installIntent = new Intent(Intent.ACTION_VIEW);
        installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
        installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(installIntent);
        call.resolve();
    }

    private SharedPreferences preferences() {
        return getContext().getSharedPreferences(PREFERENCES, 0);
    }
}
