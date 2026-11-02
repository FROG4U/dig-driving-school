/**
 * One-off setup for admin push notifications.
 *
 *   npm run push:setup
 *
 * Generates a VAPID key pair and appends it to the .env beside the app, then
 * the app needs a restart. Safe to run twice: if keys are already present it
 * changes nothing (regenerating them would silently break every device that
 * has already subscribed).
 *
 * The private key is written to .env and never printed.
 */
import fs from "fs";
import path from "path";
import webpush from "web-push";

const ENV_PATH = path.join(process.cwd(), ".env");

function main() {
  if (!fs.existsSync(ENV_PATH)) {
    console.error(`No .env found at ${ENV_PATH} - run this from the app directory.`);
    process.exit(1);
  }

  const current = fs.readFileSync(ENV_PATH, "utf8");
  if (/^VAPID_PUBLIC_KEY=.+/m.test(current)) {
    console.log("Push keys are already configured - nothing changed.");
    console.log("If notifications still do not work, restart the app and re-enable the bell.");
    return;
  }

  const backup = `${ENV_PATH}.bak.${Date.now()}`;
  fs.copyFileSync(ENV_PATH, backup);

  const keys = webpush.generateVAPIDKeys();
  const subject = process.env.VAPID_SUBJECT || "mailto:hello@drivinginstructorgloucester.co.uk";
  const block = [
    "",
    "# Admin push notifications (new enquiries) - added by npm run push:setup",
    `VAPID_PUBLIC_KEY="${keys.publicKey}"`,
    `VAPID_PRIVATE_KEY="${keys.privateKey}"`,
    `VAPID_SUBJECT="${subject}"`,
    "",
  ].join("\n");

  fs.appendFileSync(ENV_PATH, block);

  // Passenger restart trigger, so the new values are picked up straight away.
  try {
    fs.mkdirSync(path.join(process.cwd(), "tmp"), { recursive: true });
    fs.writeFileSync(path.join(process.cwd(), "tmp", "restart.txt"), String(Date.now()));
  } catch {
    /* the owner can restart from the Plesk panel instead */
  }

  console.log("Push notification keys generated and saved to .env.");
  console.log(`A backup of the previous .env is at ${path.basename(backup)}`);
  console.log("The app has been asked to restart. Now open the admin and click the bell to enable notifications.");
}

main();
