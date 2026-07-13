package com.myshift.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

public class SystemAlarmReceiver extends BroadcastReceiver {
    public static final String ACTION_RING = "com.myshift.app.SYSTEM_ALARM_RING";
    public static final String EXTRA_MESSAGE = "message";
    public static final String EXTRA_SCOPE = "scope";
    private static final String CHANNEL_ID = "my_shift_alarm";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (!ACTION_RING.equals(intent.getAction())) return;

        String message = intent.getStringExtra(EXTRA_MESSAGE);
        if (message == null || message.isEmpty()) message = "My Shift";
        String scope = intent.getStringExtra(EXTRA_SCOPE);
        int notificationId = "test".equals(scope) ? 9302 : 9301;

        ensureChannel(context);

        Intent openIntent = new Intent(context, MainActivity.class);
        openIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
            context,
            notificationId,
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder notification = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(context.getApplicationInfo().icon)
            .setContentTitle("My Shift")
            .setContentText(message)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setAutoCancel(true)
            .setOngoing(false)
            .setContentIntent(contentIntent)
            .setFullScreenIntent(contentIntent, true);

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            notification.setSound(alarmSound()).setVibrate(new long[] { 0, 600, 300, 600, 300, 900 });
        }

        try {
            NotificationManagerCompat.from(context).notify(notificationId, notification.build());
        } catch (SecurityException ignored) {
            context.startActivity(openIntent);
        }
    }

    private void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;

        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null || manager.getNotificationChannel(CHANNEL_ID) != null) return;

        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "My Shift alarms",
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("Wake-up and arrival alarms from My Shift");
        channel.setSound(
            alarmSound(),
            new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build()
        );
        channel.enableVibration(true);
        channel.setVibrationPattern(new long[] { 0, 600, 300, 600, 300, 900 });
        manager.createNotificationChannel(channel);
    }

    private static Uri alarmSound() {
        Uri alarm = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
        return alarm != null ? alarm : RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
    }
}
