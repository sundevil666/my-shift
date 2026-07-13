package com.myshift.app;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
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
    private Ringtone ringtone;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        showOverLockScreen();

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

        playAlarmSound();
    }

    @Override
    protected void onDestroy() {
        stopRingtone();
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
        ringtone.play();
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
        finishAndRemoveTask();
    }

    private void stopRingtone() {
        if (ringtone != null && ringtone.isPlaying()) {
            ringtone.stop();
        }
    }
}
