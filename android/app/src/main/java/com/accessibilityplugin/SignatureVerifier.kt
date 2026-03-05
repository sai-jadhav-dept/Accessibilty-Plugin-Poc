package com.accessibilityplugin

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import java.io.ByteArrayInputStream
import java.security.MessageDigest
import java.security.cert.CertificateFactory
import java.security.cert.X509Certificate

object SignatureVerifier {
    fun isSignatureValid(context: Context): Boolean {
        return try {
            val expectedSha256 = "FAC6745DC0903786FB9EDE62A962B399F7348F0BB6F899B8332667591033B9C"

            if (expectedSha256.isBlank()) {
                return BuildConfig.DEBUG
            }

            val packageManager = context.packageManager
            val packageName = context.packageName

            val signatures: Array<android.content.pm.Signature>? =
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {

                    val packageInfo = packageManager.getPackageInfo(
                        packageName,
                        PackageManager.GET_SIGNING_CERTIFICATES
                    )

                    packageInfo.signingInfo?.apkContentsSigners

                } else {

                    @Suppress("DEPRECATION")
                    val packageInfo = packageManager.getPackageInfo(
                        packageName,
                        PackageManager.GET_SIGNATURES
                    )

                    @Suppress("DEPRECATION")
                    packageInfo.signatures
                }

            if (signatures == null) {
                return false
            }

            for (signature in signatures) {

                val certFactory = CertificateFactory.getInstance("X509")
                val cert = certFactory.generateCertificate(
                    ByteArrayInputStream(signature.toByteArray())
                ) as X509Certificate

                val sha256 = MessageDigest.getInstance("SHA-256")
                    .digest(cert.encoded)
                    .joinToString("") { "%02X".format(it) }

                if (sha256.equals(expectedSha256, ignoreCase = true)) {
                    return true
                }
            }

            false

        } catch (e: Exception) {
            false
        }
    }
}