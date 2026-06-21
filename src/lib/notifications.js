// Local (on-device) reminder notifications in Nailong's voice. No server needed.
// NOTE: fully works in a dev/standalone build. Expo Go's notification support is
// limited (especially Android), so test reminders in a real build.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { addDays } from './cycle';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

function at9am(date) {
  const x = new Date(date);
  x.setHours(9, 0, 0, 0);
  return x;
}

// Reschedules all reminders from scratch based on the latest predictions.
export async function scheduleReminders({ predictions, username }) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const name = username ? `Mommy ${username}` : 'Mom';
  const DATE = Notifications.SchedulableTriggerInputTypes.DATE;
  const DAILY = Notifications.SchedulableTriggerInputTypes.DAILY;
  const now = new Date();

  if (predictions?.nextPeriod) {
    // Period coming soon (2 days before)
    const soon = at9am(addDays(predictions.nextPeriod, -2));
    if (soon > now) {
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Nailong 💛', body: `${name}, your period may start in about 2 days. Let's get cozy and stock up on snacks!` },
        trigger: { type: DATE, date: soon },
      });
    }
    // Period expected today
    const today = at9am(predictions.nextPeriod);
    if (today > now) {
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Nailong 💛', body: `${name}, your period might come today. Nailong is here with a big squishy belly hug 🤗` },
        trigger: { type: DATE, date: today },
      });
    }
  }

  // Daily check-in nudge at 8pm
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Nailong 💛', body: `How are you feeling today, ${name}? Tap to log your check-in.` },
    trigger: { type: DAILY, hour: 20, minute: 0 },
  });
}

export async function cancelReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
