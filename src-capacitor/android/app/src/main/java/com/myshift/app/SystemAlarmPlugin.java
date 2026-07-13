package com.myshift.app;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.RingtoneManager;
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
    private static final String ALARM_RINGTONE_URI = "alarm_ringtone_uri";

    @PluginMethod
    public void setAlarm(PluginCall call) {
        String id = call.getString("id");
        String message = call.getString("message", "My Shift");
        Double timestamp = call.getDouble("timestamp");
        if (id == null || timestamp == null) {
            call.reject("Missing alarm id or timestamp");
            return;
        }

        SharedPreferences preferences = preferences();
        if (id.equals(preferences.getString(LAST_ALARM_ID, null))) {
            JSObject result = new JSObject();
            result.put("created", false);
            call.resolve(result);
            return;
        }

        dismissRememberedAlarm();

        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(timestamp.longValue());

        Intent intent = new Intent(AlarmClock.ACTION_SET_ALARM);
        intent.putExtra(AlarmClock.EXTRA_HOUR, calendar.get(Calendar.HOUR_OF_DAY));
        intent.putExtra(AlarmClock.EXTRA_MINUTES, calendar.get(Calendar.MINUTE));
        intent.putExtra(AlarmClock.EXTRA_MESSAGE, message);
        intent.putExtra(AlarmClock.EXTRA_VIBRATE, true);
        intent.putExtra(AlarmClock.EXTRA_SKIP_UI, true);
        String ringtoneUri = preferences.getString(ALARM_RINGTONE_URI, null);
        if (ringtoneUri != null) {
            intent.putExtra(AlarmClock.EXTRA_RINGTONE, ringtoneUri);
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        if (intent.resolveActivity(getContext().getPackageManager()) == null) {
            call.reject("No Android clock app is available");
            return;
        }

        try {
            getContext().startActivity(intent);
            preferences.edit()
                .putString(LAST_ALARM_ID, id)
                .putString(LAST_ALARM_MESSAGE, message)
                .apply();
            JSObject result = new JSObject();
            result.put("created", true);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Could not create system alarm", error);
        }
    }

    @PluginMethod
    public void clearRememberedAlarm(PluginCall call) {
        dismissRememberedAlarm();
        preferences().edit().remove(LAST_ALARM_ID).remove(LAST_ALARM_MESSAGE).apply();
        call.resolve();
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        JSObject result = new JSObject();
        result.put("canSetAlarm", canResolve(new Intent(AlarmClock.ACTION_SET_ALARM)));
        result.put("hasCustomSound", preferences().contains(ALARM_RINGTONE_URI));
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
}
