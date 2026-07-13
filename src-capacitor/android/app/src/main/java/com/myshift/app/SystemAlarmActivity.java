package com.myshift.app;

import android.app.Activity;
import android.app.NotificationManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.Gravity;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

public class SystemAlarmActivity extends Activity {
    public static final String EXTRA_MESSAGE = "message";
    public static final String EXTRA_SCOPE = "scope";
    private static final String PREFERENCES = "my_shift_system_alarm";
    private static final String ALARM_RINGTONE_URI = "alarm_ringtone_uri";
    private static final String ALARM_VIBRATION_ENABLED = "alarm_vibration_enabled";
    private static final String ALARM_VOLUME_RAMP_ENABLED = "alarm_volume_ramp_enabled";
    private static final String LAST_ALARM_ACTIVITY_ERROR = "last_alarm_activity_error";
    private static final long[] VIBRATION_PATTERN = new long[] { 0, 600, 300, 600, 300, 900 };
    private Ringtone ringtone;
    private Vibrator vibrator;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable volumeRamp = new Runnable() {
        private int step = 0;

        @Override
        public void run() {
            if (ringtone == null || !ringtone.isPlaying()) return;
            setRingtoneVolume(Math.min(1f, 0.08f + (step * 0.08f)));
            step += 1;
            if (step <= 12) {
                handler.postDelayed(this, 2500);
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        showOverLockScreen();
        cancelAlarmNotification();
        getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE).edit().remove(LAST_ALARM_ACTIVITY_ERROR).apply();

        String message = getIntent().getStringExtra(EXTRA_MESSAGE);
        if (message == null || message.isEmpty()) message = "My Shift";

        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setGravity(Gravity.CENTER);
        int padding = Math.round(28 * getResources().getDisplayMetrics().density);
        layout.setPadding(padding, padding, padding, padding);

        TextView title = new TextView(this);
        title.setText("My Shift");
        title.setTextSize(28);
        title.setGravity(Gravity.CENTER);
        title.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);

        TextView body = new TextView(this);
        body.setText(message);
        body.setTextSize(20);
        body.setGravity(Gravity.CENTER);
        body.setPadding(0, padding, 0, padding);

        Button stop = new Button(this);
        stop.setText("Stop alarm");
        stop.setTextSize(18);
        stop.setAllCaps(false);
        stop.setOnClickListener((view) -> stopAndClose());

        layout.addView(title);
        layout.addView(body);
        layout.addView(stop);
        setContentView(layout);

        try {
            playAlarmSound();
        } catch (Exception error) {
            rememberActivityError("sound:" + error.getClass().getSimpleName() + ": " + error.getMessage());
        }
        try {
            startVibration();
        } catch (Exception error) {
            rememberActivityError("vibration:" + error.getClass().getSimpleName() + ": " + error.getMessage());
        }
    }

    @Override
    protected void onDestroy() {
        stopRingtone();
        stopVibration();
        super.onDestroy();
    }

    private void showOverLockScreen() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        } else {
            getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            );
        }
        getWindow().addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
        );
    }

    private void playAlarmSound() {
        Uri uri = selectedAlarmSound();
        ringtone = RingtoneManager.getRingtone(this, uri);
        if (ringtone == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            ringtone.setAudioAttributes(
                new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
            );
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            ringtone.setLooping(true);
        }
        if (isVolumeRampEnabled()) {
            setRingtoneVolume(0.08f);
        }
        ringtone.play();
        if (isVolumeRampEnabled()) {
            handler.postDelayed(volumeRamp, 1000);
        }
    }

    private Uri selectedAlarmSound() {
        SharedPreferences preferences = getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE);
        String stored = preferences.getString(ALARM_RINGTONE_URI, null);
        if (stored != null) return Uri.parse(stored);
        Uri alarm = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
        return alarm != null ? alarm : RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
    }

    private void stopAndClose() {
        stopRingtone();
        stopVibration();
        cancelAlarmNotification();
        finishAndRemoveTask();
    }

    private void cancelAlarmNotification() {
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager == null) return;
        String scope = getIntent().getStringExtra(EXTRA_SCOPE);
        manager.cancel("test".equals(scope) ? 9302 : 9301);
    }

    private void stopRingtone() {
        handler.removeCallbacks(volumeRamp);
        try {
            if (ringtone != null && ringtone.isPlaying()) {
                ringtone.stop();
            }
        } catch (Exception error) {
            rememberActivityError("stop-sound:" + error.getClass().getSimpleName() + ": " + error.getMessage());
        }
    }

    private void setRingtoneVolume(float volume) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P && ringtone != null) {
                ringtone.setVolume(volume);
            }
        } catch (Exception error) {
            rememberActivityError("volume:" + error.getClass().getSimpleName() + ": " + error.getMessage());
        }
    }

    private void startVibration() {
        if (!isVibrationEnabled()) return;
        vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        if (vibrator == null || !vibrator.hasVibrator()) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createWaveform(VIBRATION_PATTERN, 0));
        } else {
            vibrator.vibrate(VIBRATION_PATTERN, 0);
        }
    }

    private void stopVibration() {
        try {
            if (vibrator != null) {
                vibrator.cancel();
            }
        } catch (Exception error) {
            rememberActivityError("stop-vibration:" + error.getClass().getSimpleName() + ": " + error.getMessage());
        }
    }

    private boolean isVibrationEnabled() {
        return getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)
            .getBoolean(ALARM_VIBRATION_ENABLED, true);
    }

    private boolean isVolumeRampEnabled() {
        return getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)
            .getBoolean(ALARM_VOLUME_RAMP_ENABLED, true);
    }

    private void rememberActivityError(String error) {
        getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)
            .edit()
            .putString(LAST_ALARM_ACTIVITY_ERROR, error)
            .apply();
    }
}
