package com.accessibilityplugin

import android.app.AlertDialog
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    if (!SignatureVerifier.isSignatureValid(this)) {
      showTamperedDialog()
    }
  }

  private fun showTamperedDialog() {
    if (isFinishing || isDestroyed) {
      return
    }

    AlertDialog.Builder(this)
      .setTitle("Security Alert")
      .setMessage("This app has been tampered and cannot be opened.")
      .setCancelable(false)
      .setPositiveButton("Close") { _, _ ->
        finishAffinity()
        kotlin.system.exitProcess(0)
      }
      .show()
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "AccessibilityPlugin"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
