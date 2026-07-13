package com.myshift.app;

import android.app.Activity;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ResolveInfo;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.os.Build;
import android.provider.AlarmClock;
import android.provider.Settings;
import android.net.Uri;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Calendar;

@CapacitorPlugin(name = "SystemAlarm")
public class SystemAlarmPlugin extends Plugin {
    private static final String PREFERENCES = "my_shift_system_alarm";
    private static final String LAST_ALARM_ID = "last_alarm_id";
    private static final String LAST_ALARM_MESSAGE = "last_alarm_message";
    private static final String LAST_ALARM_TIMESTAMP = "last_alarm_timestamp";
    private static final String LAST_SET_ALARM_ERROR = "last_set_alarm_error";
    private static final String LAST_SET_ALARM_ATTEMPT = "last_set_alarm_attempt";
    private static final String LAST_SET_ALARM_RESULT = "last_set_alarm_result";
    private static final String LAST_ALARM_FIRED = "last_alarm_fired";
    private static final String LAST_ALARM_DELIVERY = "last_alarm_delivery";
    private static final String ALARM_RINGTONE_URI = "alarm_ringtone_uri";
    private static final String ALARM_VIBRATION_ENABLED = "alarm_vibration_enabled";
    private static final String ALARM_VOLUME_RAMP_ENABLED = "alarm_volume_ramp_enabled";
    private static final String TEST_ALARM_PREFIX = "my-shift:test-system-alarm";
    private Ringtone previewRingtone;

    @PluginMethod
    public void setAlarm(PluginCall call) {
        String id = call.getString("id");
        String message = call.getString("message", "My Shift");
        Long timestamp = getTimestamp(call);
        if (id == null || timestamp == null) {
            call.reject("Missing alarm id or timestamp: " + describeAlarmCall(call));
            return;
        }

        SharedPreferences preferences = preferences();
        String scope = alarmScope(id);
        preferences.edit()
            .putLong(LAST_SET_ALARM_ATTEMPT, System.currentTimeMillis())
            .remove(LAST_SET_ALARM_ERROR)
            .remove(LAST_SET_ALARM_RESULT)
            .apply();

        long rememberedTimestamp = getRememberedLong(scope, LAST_ALARM_TIMESTAMP);
        if (
            id.equals(getRememberedString(scope, LAST_ALARM_ID)) &&
            rememberedTimestamp == timestamp &&
            timestamp > System.currentTimeMillis()
        ) {
            preferences.edit().putString(LAST_SET_ALARM_RESULT, "duplicate-id-skipped").apply();
            JSObject result = new JSObject();
            result.put("created", false);
            call.resolve(result);
            return;
        }

        try {
            setOwnedAlarm(scope, timestamp, message);
            SharedPreferences.Editor editor = preferences.edit()
                .putString(scopedKey(scope, LAST_ALARM_ID), id)
                .putString(scopedKey(scope, LAST_ALARM_MESSAGE), message)
                .putLong(scopedKey(scope, LAST_ALARM_TIMESTAMP), timestamp)
                .putString(LAST_SET_ALARM_RESULT, rememberedTimestamp > 0 ? "rescheduled" : "created")
                .remove(LAST_SET_ALARM_ERROR);
            if ("regular".equals(scope)) {
                editor.remove(LAST_ALARM_ID).remove(LAST_ALARM_MESSAGE).remove(LAST_ALARM_TIMESTAMP);
            }
            editor.apply();
            JSObject result = new JSObject();
            result.put("created", true);
            call.resolve(result);
        } catch (Exception error) {
            preferences.edit()
                .putString(LAST_SET_ALARM_ERROR, error.getClass().getSimpleName() + ": " + error.getMessage())
                .putString(LAST_SET_ALARM_RESULT, "failed")
                .apply();
            call.reject("Could not create system alarm", error);
        }
    }

    @PluginMethod
    public void clearRememberedAlarm(PluginCall call) {
        String scope = alarmScope(call.getString("id", null));
        cancelOwnedAlarm(scope);
        SharedPreferences.Editor editor = preferences().edit()
            .remove(scopedKey(scope, LAST_ALARM_ID))
            .remove(scopedKey(scope, LAST_ALARM_MESSAGE))
            .remove(scopedKey(scope, LAST_ALARM_TIMESTAMP))
            .putString(LAST_SET_ALARM_RESULT, scope + "-cancelled");
        if ("regular".equals(scope)) {
            editor.remove(LAST_ALARM_ID).remove(LAST_ALARM_MESSAGE).remove(LAST_ALARM_TIMESTAMP);
        }
        editor.apply();
        call.resolve();
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        JSObject result = new JSObject();
        putResolveInfo(result, "clock", new Intent(AlarmClock.ACTION_SET_ALARM));
        putResolveInfo(result, "dismiss", new Intent(AlarmClock.ACTION_DISMISS_ALARM));
        putResolveInfo(result, "ringtonePicker", new Intent(RingtoneManager.ACTION_RINGTONE_PICKER));
        putResolveInfo(result, "soundSettings", new Intent(Settings.ACTION_SOUND_SETTINGS));
        SharedPreferences preferences = preferences();
        long lastAlarmTimestamp = getRememberedLong("regular", LAST_ALARM_TIMESTAMP);
        long lastTestAlarmTimestamp = getRememberedLong("test", LAST_ALARM_TIMESTAMP);
        long lastAttempt = preferences.getLong(LAST_SET_ALARM_ATTEMPT, 0);
        result.put("canSetAlarm", canScheduleOwnedAlarms());
        result.put("canScheduleExactAlarms", canScheduleOwnedAlarms());
        result.put("hasCustomSound", preferences().contains(ALARM_RINGTONE_URI));
        result.put("vibrationEnabled", preferences.getBoolean(ALARM_VIBRATION_ENABLED, true));
        result.put("volumeRampEnabled", preferences.getBoolean(ALARM_VOLUME_RAMP_ENABLED, true));
        result.put("lastAlarmId", getRememberedString("regular", LAST_ALARM_ID));
        result.put("lastAlarmMessage", getRememberedString("regular", LAST_ALARM_MESSAGE));
        if (lastAlarmTimestamp > 0) {
            result.put("lastAlarmTimestamp", lastAlarmTimestamp);
            result.put("lastAlarmIso", new java.util.Date(lastAlarmTimestamp).toString());
        }
        result.put("lastTestAlarmId", getRememberedString("test", LAST_ALARM_ID));
        result.put("lastTestAlarmMessage", getRememberedString("test", LAST_ALARM_MESSAGE));
        if (lastTestAlarmTimestamp > 0) {
            result.put("lastTestAlarmTimestamp", lastTestAlarmTimestamp);
            result.put("lastTestAlarmIso", new java.util.Date(lastTestAlarmTimestamp).toString());
        }
        result.put("lastSetAlarmError", preferences.getString(LAST_SET_ALARM_ERROR, null));
        if (lastAttempt > 0) {
            result.put("lastSetAlarmAttemptIso", new java.util.Date(lastAttempt).toString());
        }
        result.put("lastSetAlarmResult", preferences.getString(LAST_SET_ALARM_RESULT, null));
        long lastAlarmFired = preferences.getLong(LAST_ALARM_FIRED, 0);
        if (lastAlarmFired > 0) {
            result.put("lastAlarmFiredIso", new java.util.Date(lastAlarmFired).toString());
        }
        result.put("lastAlarmDelivery", preferences.getString(LAST_ALARM_DELIVERY, null));
        result.put("manufacturer", Build.MANUFACTURER);
        result.put("model", Build.MODEL);
        result.put("sdkInt", Build.VERSION.SDK_INT);
        call.resolve(result);
    }

    @PluginMethod
    public void chooseAlarmSound(PluginCall call) {
        Intent intent = new Intent(RingtoneManager.ACTION_RINGTONE_PICKER);
        intent.putExtra(RingtoneManager.EXTRA_RINGTONE_TYPE, RingtoneManager.TYPE_ALARM);
        intent.putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_DEFAULT, true);
        intent.putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_SILENT, false);
        intent.putExtra(RingtoneManager.EXTRA_RINGTONE_TITLE, "My Shift alarm sound");

        String current = preferences().getString(ALARM_RINGTONE_URI, null);
        if (current != null) {
            intent.putExtra(RingtoneManager.EXTRA_RINGTONE_EXISTING_URI, Uri.parse(current));
        }

        if (!canResolve(intent)) {
            call.reject("No Android ringtone picker is available");
            return;
        }

        startActivityForResult(call, intent, "alarmSoundCallback");
    }

    @PluginMethod
    public void setAlarmOptions(PluginCall call) {
        SharedPreferences.Editor editor = preferences().edit();
        if (call.getData().has("vibrationEnabled")) {
            editor.putBoolean(ALARM_VIBRATION_ENABLED, call.getBoolean("vibrationEnabled", true));
        }
        if (call.getData().has("volumeRampEnabled")) {
            editor.putBoolean(ALARM_VOLUME_RAMP_ENABLED, call.getBoolean("volumeRampEnabled", true));
        }
        editor.apply();
        JSObject response = new JSObject();
        response.put("vibrationEnabled", preferences().getBoolean(ALARM_VIBRATION_ENABLED, true));
        response.put("volumeRampEnabled", preferences().getBoolean(ALARM_VOLUME_RAMP_ENABLED, true));
        call.resolve(response);
    }

    @PluginMethod
    public void previewAlarmSound(PluginCall call) {
        stopPreviewRingtone();
        Uri uri = selectedAlarmSound();
        previewRingtone = RingtoneManager.getRingtone(getContext(), uri);
        if (previewRingtone == null) {
            call.reject("Alarm sound is unavailable");
            return;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            previewRingtone.setAudioAttributes(
                new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
            );
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            previewRingtone.setVolume(preferences().getBoolean(ALARM_VOLUME_RAMP_ENABLED, true) ? 0.18f : 0.65f);
        }
        previewRingtone.play();
        call.resolve();
    }

    @PluginMethod
    public void stopAlarmPreview(PluginCall call) {
        stopPreviewRingtone();
        call.resolve();
    }

    @PluginMethod
    public void openAlarmSettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_SOUND_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        if (!canResolve(intent)) {
            call.reject("No Android sound settings are available");
            return;
        }
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void openExactAlarmSettings(PluginCall call) {
        Intent intent;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
            intent.setData(Uri.parse("package:" + getContext().getPackageName()));
        } else {
            intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.setData(Uri.parse("package:" + getContext().getPackageName()));
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception error) {
            Intent fallback = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            fallback.setData(Uri.parse("package:" + getContext().getPackageName()));
            fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            try {
                getContext().startActivity(fallback);
                call.resolve();
            } catch (Exception fallbackError) {
                call.reject("No exact alarm settings screen is available", fallbackError);
            }
        }
    }

    @ActivityCallback
    private void alarmSoundCallback(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null) {
            call.reject("Alarm sound was not selected");
            return;
        }

        Uri ringtone = result.getData().getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI);
        if (ringtone == null) {
            call.reject("Alarm sound was not selected");
            return;
        }

        preferences().edit().putString(ALARM_RINGTONE_URI, ringtone.toString()).apply();
        JSObject response = new JSObject();
        response.put("selected", true);
        call.resolve(response);
    }

    private SharedPreferences preferences() {
        return getContext().getSharedPreferences(PREFERENCES, 0);
    }

    @Override
    protected void handleOnDestroy() {
        stopPreviewRingtone();
        super.handleOnDestroy();
    }

    private AlarmManager getAlarmManager() {
        return (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
    }

    private void setOwnedAlarm(String scope, long timestamp, String message) {
        AlarmManager alarmManager = getAlarmManager();
        if (alarmManager == null) {
            throw new IllegalStateException("AlarmManager is unavailable");
        }
        if (!canScheduleOwnedAlarms()) {
            throw new SecurityException("Exact alarm permission is not granted");
        }
        PendingIntent operation = alarmPendingIntent(scope, message, PendingIntent.FLAG_UPDATE_CURRENT);
        PendingIntent showIntent = showPendingIntent(scope);
        alarmManager.cancel(operation);
        alarmManager.setAlarmClock(new AlarmManager.AlarmClockInfo(timestamp, showIntent), operation);
    }

    private void cancelOwnedAlarm(String scope) {
        AlarmManager alarmManager = getAlarmManager();
        PendingIntent activityOperation = alarmActivityPendingIntent(scope, null, PendingIntent.FLAG_NO_CREATE);
        PendingIntent receiverOperation = alarmPendingIntent(scope, null, PendingIntent.FLAG_NO_CREATE);
        if (alarmManager != null) {
            if (activityOperation != null) alarmManager.cancel(activityOperation);
            if (receiverOperation != null) alarmManager.cancel(receiverOperation);
        }
        if (activityOperation != null) activityOperation.cancel();
        if (receiverOperation != null) receiverOperation.cancel();
    }

    private PendingIntent alarmActivityPendingIntent(String scope, String message, int createFlag) {
        Intent intent = new Intent(getContext(), SystemAlarmActivity.class);
        intent.putExtra(SystemAlarmActivity.EXTRA_SCOPE, scope);
        if (message != null) {
            intent.putExtra(SystemAlarmActivity.EXTRA_MESSAGE, message);
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(
            getContext(),
            requestCode(scope),
            intent,
            createFlag | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private PendingIntent alarmPendingIntent(String scope, String message, int createFlag) {
        Intent intent = new Intent(getContext(), SystemAlarmReceiver.class);
        intent.setAction(SystemAlarmReceiver.ACTION_RING);
        intent.putExtra(SystemAlarmReceiver.EXTRA_SCOPE, scope);
        if (message != null) {
            intent.putExtra(SystemAlarmReceiver.EXTRA_MESSAGE, message);
        }
        return PendingIntent.getBroadcast(
            getContext(),
            requestCode(scope),
            intent,
            createFlag | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private PendingIntent showPendingIntent(String scope) {
        Intent intent = new Intent(getContext(), MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(
            getContext(),
            requestCode(scope) + 100,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private int requestCode(String scope) {
        return "test".equals(scope) ? 9302 : 9301;
    }

    private boolean canScheduleOwnedAlarms() {
        AlarmManager alarmManager = getAlarmManager();
        if (alarmManager == null) return false;
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.S || alarmManager.canScheduleExactAlarms();
    }

    private boolean canResolve(Intent intent) {
        return intent.resolveActivity(getContext().getPackageManager()) != null;
    }

    private String alarmScope(String id) {
        return id != null && id.startsWith(TEST_ALARM_PREFIX) ? "test" : "regular";
    }

    private String scopedKey(String scope, String key) {
        return scope + "_" + key;
    }

    private String getRememberedString(String scope, String key) {
        SharedPreferences preferences = preferences();
        String value = preferences.getString(scopedKey(scope, key), null);
        if (value == null && "regular".equals(scope)) {
            value = preferences.getString(key, null);
        }
        return value;
    }

    private long getRememberedLong(String scope, String key) {
        SharedPreferences preferences = preferences();
        long value = preferences.getLong(scopedKey(scope, key), 0);
        if (value == 0 && "regular".equals(scope)) {
            value = preferences.getLong(key, 0);
        }
        return value;
    }

    private Long getTimestamp(PluginCall call) {
        Object value = call.getData().opt("timestamp");
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        if (value instanceof String) {
            try {
                return Long.parseLong((String) value);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private String describeAlarmCall(PluginCall call) {
        Object id = call.getData().opt("id");
        Object timestamp = call.getData().opt("timestamp");
        return "idType=" + typeName(id) + ", timestampType=" + typeName(timestamp);
    }

    private String typeName(Object value) {
        if (value == null) return "null";
        return value.getClass().getName();
    }

    private void putResolveInfo(JSObject result, String prefix, Intent intent) {
        ResolveInfo resolveInfo = getContext().getPackageManager().resolveActivity(intent, 0);
        if (resolveInfo == null || resolveInfo.activityInfo == null) return;
        result.put(prefix + "Package", resolveInfo.activityInfo.packageName);
        result.put(prefix + "Activity", resolveInfo.activityInfo.name);
    }

    private Intent buildSetAlarmIntent(
        Calendar calendar,
        String message,
        boolean skipUi,
        boolean includeRingtone
    ) {
        Intent intent = new Intent(AlarmClock.ACTION_SET_ALARM);
        intent.putExtra(AlarmClock.EXTRA_HOUR, calendar.get(Calendar.HOUR_OF_DAY));
        intent.putExtra(AlarmClock.EXTRA_MINUTES, calendar.get(Calendar.MINUTE));
        intent.putExtra(AlarmClock.EXTRA_MESSAGE, message);
        intent.putExtra(AlarmClock.EXTRA_VIBRATE, true);
        intent.putExtra(AlarmClock.EXTRA_SKIP_UI, skipUi);

        String ringtoneUri = preferences().getString(ALARM_RINGTONE_URI, null);
        if (includeRingtone && ringtoneUri != null) {
            intent.putExtra(AlarmClock.EXTRA_RINGTONE, ringtoneUri);
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        return intent;
    }

    private Uri selectedAlarmSound() {
        String stored = preferences().getString(ALARM_RINGTONE_URI, null);
        if (stored != null) return Uri.parse(stored);
        Uri alarm = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
        return alarm != null ? alarm : RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
    }

    private void stopPreviewRingtone() {
        if (previewRingtone != null && previewRingtone.isPlaying()) {
            previewRingtone.stop();
        }
        previewRingtone = null;
    }

}
