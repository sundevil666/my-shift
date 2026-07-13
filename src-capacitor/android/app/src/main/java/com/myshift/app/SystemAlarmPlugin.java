package com.myshift.app;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.ResolveInfo;
import android.content.SharedPreferences;
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
    private static final String ALARM_RINGTONE_URI = "alarm_ringtone_uri";

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
        preferences.edit()
            .putLong(LAST_SET_ALARM_ATTEMPT, System.currentTimeMillis())
            .remove(LAST_SET_ALARM_ERROR)
            .remove(LAST_SET_ALARM_RESULT)
            .apply();

        if (id.equals(preferences.getString(LAST_ALARM_ID, null))) {
            preferences.edit().putString(LAST_SET_ALARM_RESULT, "duplicate-id-skipped").apply();
            JSObject result = new JSObject();
            result.put("created", false);
            call.resolve(result);
            return;
        }

        dismissRememberedAlarm();

        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(timestamp);

        boolean skipUi = Boolean.TRUE.equals(call.getBoolean("skipUi", true));
        boolean includeRingtone = Boolean.TRUE.equals(call.getBoolean("includeRingtone", true));
        Intent alarmIntent = buildSetAlarmIntent(calendar, message, skipUi, includeRingtone);

        if (!canResolve(alarmIntent)) {
            preferences.edit()
                .putString(LAST_SET_ALARM_ERROR, "No Android clock app is available")
                .putString(LAST_SET_ALARM_RESULT, "failed")
                .apply();
            call.reject("No Android clock app is available");
            return;
        }

        try {
            startAlarm(alarmIntent, calendar, message, includeRingtone);
            preferences.edit()
                .putString(LAST_ALARM_ID, id)
                .putString(LAST_ALARM_MESSAGE, message)
                .putLong(LAST_ALARM_TIMESTAMP, timestamp)
                .putString(LAST_SET_ALARM_RESULT, "created")
                .remove(LAST_SET_ALARM_ERROR)
                .apply();
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
        dismissRememberedAlarm();
        preferences().edit()
            .remove(LAST_ALARM_ID)
            .remove(LAST_ALARM_MESSAGE)
            .remove(LAST_ALARM_TIMESTAMP)
            .apply();
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
        long lastAlarmTimestamp = preferences.getLong(LAST_ALARM_TIMESTAMP, 0);
        long lastAttempt = preferences.getLong(LAST_SET_ALARM_ATTEMPT, 0);
        result.put("canSetAlarm", canResolve(new Intent(AlarmClock.ACTION_SET_ALARM)));
        result.put("hasCustomSound", preferences().contains(ALARM_RINGTONE_URI));
        result.put("lastAlarmId", preferences.getString(LAST_ALARM_ID, null));
        result.put("lastAlarmMessage", preferences.getString(LAST_ALARM_MESSAGE, null));
        if (lastAlarmTimestamp > 0) {
            result.put("lastAlarmTimestamp", lastAlarmTimestamp);
            result.put("lastAlarmIso", new java.util.Date(lastAlarmTimestamp).toString());
        }
        result.put("lastSetAlarmError", preferences.getString(LAST_SET_ALARM_ERROR, null));
        if (lastAttempt > 0) {
            result.put("lastSetAlarmAttemptIso", new java.util.Date(lastAttempt).toString());
        }
        result.put("lastSetAlarmResult", preferences.getString(LAST_SET_ALARM_RESULT, null));
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

    private void dismissRememberedAlarm() {
        String message = preferences().getString(LAST_ALARM_MESSAGE, null);
        if (message == null) return;

        Intent intent = new Intent(AlarmClock.ACTION_DISMISS_ALARM);
        intent.putExtra(AlarmClock.EXTRA_ALARM_SEARCH_MODE, AlarmClock.ALARM_SEARCH_MODE_LABEL);
        intent.putExtra(AlarmClock.EXTRA_MESSAGE, message);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        if (intent.resolveActivity(getContext().getPackageManager()) == null) return;

        try {
            getContext().startActivity(intent);
        } catch (Exception ignored) {
            // Some clock apps don't support dismissing alarms by label.
        }
    }

    private SharedPreferences preferences() {
        return getContext().getSharedPreferences(PREFERENCES, 0);
    }

    private boolean canResolve(Intent intent) {
        return intent.resolveActivity(getContext().getPackageManager()) != null;
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

    private void startAlarm(
        Intent alarmIntent,
        Calendar calendar,
        String message,
        boolean includeRingtone
    ) {
        try {
            getContext().startActivity(alarmIntent);
        } catch (Exception firstError) {
            try {
                Intent visibleIntent = buildSetAlarmIntent(calendar, message, false, includeRingtone);
                getContext().startActivity(visibleIntent);
            } catch (Exception visibleError) {
                Intent basicIntent = buildSetAlarmIntent(calendar, message, false, false);
                getContext().startActivity(basicIntent);
            }
        }
    }
}
