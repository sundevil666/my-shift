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
import java.security.MessageDigest;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "NativeUpdater")
public class NativeUpdaterPlugin extends Plugin {
    private static final String BACKUP_KEY = "user_data_backup";
    private static final long MAX_APK_BYTES = 200L * 1024L * 1024L;
    private static final String PREFERENCES = "my_shift_updates";
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    @PluginMethod
    public void install(PluginCall call) {
        String url = call.getString("url");
        String sha256 = call.getString("sha256");
        String backup = call.getString("backup");
        if (url == null || sha256 == null || backup == null) {
            call.reject("Missing update URL, checksum or backup");
            return;
        }
        if (!url.startsWith("https://") || !sha256.matches("(?i)^[a-f0-9]{64}$")) {
            call.reject("Invalid update source or checksum");
            return;
        }

        preferences().edit().putString(BACKUP_KEY, backup).apply();
        executor.execute(() -> downloadAndInstall(url, sha256, call));
    }

    @PluginMethod
    public void consumeBackup(PluginCall call) {
        JSObject result = new JSObject();
        result.put("backup", preferences().getString(BACKUP_KEY, null));
        preferences().edit().remove(BACKUP_KEY).apply();
        call.resolve(result);
    }

    private void downloadAndInstall(String source, String expectedSha256, PluginCall call) {
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
            if (!"https".equalsIgnoreCase(connection.getURL().getProtocol())) {
                throw new SecurityException("Update redirect must use HTTPS");
            }
            if (connection.getResponseCode() < 200 || connection.getResponseCode() >= 300) {
                throw new IllegalStateException("Update download failed");
            }
            if (connection.getContentLengthLong() > MAX_APK_BYTES) {
                throw new IllegalStateException("Update file is too large");
            }

            try (InputStream input = connection.getInputStream();
                 FileOutputStream output = new FileOutputStream(apk)) {
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                byte[] buffer = new byte[16_384];
                int count;
                long totalBytes = 0;
                while ((count = input.read(buffer)) >= 0) {
                    totalBytes += count;
                    if (totalBytes > MAX_APK_BYTES) {
                        throw new IllegalStateException("Update file is too large");
                    }
                    output.write(buffer, 0, count);
                    digest.update(buffer, 0, count);
                }
                StringBuilder actualSha256 = new StringBuilder();
                for (byte value : digest.digest()) {
                    actualSha256.append(String.format("%02x", value));
                }
                if (!actualSha256.toString().equalsIgnoreCase(expectedSha256)) {
                    if (!apk.delete()) apk.deleteOnExit();
                    throw new SecurityException("Downloaded APK checksum mismatch");
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
