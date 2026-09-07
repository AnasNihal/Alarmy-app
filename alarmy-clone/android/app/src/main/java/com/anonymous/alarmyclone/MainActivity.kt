package com.anonymous.alarmyclone

import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import android.content.Intent
import android.util.Log

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
  private val alarmTag = "AlarmyAlarm"

  override fun onCreate(savedInstanceState: Bundle?) {
    Log.i(alarmTag, "MainActivity onCreate data=${intent?.data} extras=${intent?.extras?.keySet()}")
    // Expo's template intentionally passes null state here, but preserve the
    // native alarm intent so Linking can read it during a cold start.
    setIntent(intent)
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme);
    // These flags allow the full-screen alarm activity to wake and appear over the lock screen.
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
    } else {
      window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED)
      window.addFlags(WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON)
    }
    // The ringing activity must remain interactive even if Expo's optional
    // keep-awake dev hook cannot find the current Activity during cold start.
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    super.onCreate(null)
  }

  override fun onNewIntent(intent: Intent) {
    setIntent(intent)
    Log.i(alarmTag, "MainActivity onNewIntent data=${intent.data} extras=${intent.extras?.keySet()}")
    // Update the Activity intent before React/Expo processes it so Linking
    // receives the alarm URI on a warm/backgrounded app.
    super.onNewIntent(intent)
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }
}
