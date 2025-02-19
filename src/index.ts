import { SMTPServer } from "smtp-server";
import { simpleParser } from "mailparser";
import { Pool } from "pg";
import { emails } from "./database/schema";
import { db } from "./lib/database";

// PostgreSQL Connection
const client = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const smtpServer = new SMTPServer({
  allowInsecureAuth: true,
  authOptional: true,
  async onData(stream, session, callback): Promise<void> {
    try {
      const parsedEmail = await simpleParser(stream);
      const recipientEmail = session.envelope.rcptTo[0]?.address;
      const mailFrom = session.envelope.mailFrom;
      let senderEmail = "";

      if (typeof mailFrom !== "object") {
        console.log("Invalid sender email, ignoring...");
        return callback();
      }

      senderEmail = mailFrom.address;

      console.log("recipientEmail", recipientEmail);
      console.log("senderEmail", senderEmail);

      // Find the userId associated with the recipient email
      // const user = await db.query.emails.findFirst({
      //   where: eq(emails.recipientEmail, recipientEmail),
      // });

      // if (!user) {
      //   console.log("Unknown email, ignoring...");
      //   return callback();
      // }

      // Store the email in the database
      const insertedEmail = await db
        .insert(emails)
        .values({
          userId: "123", // Ensure emails are linked to the correct user
          recipientEmail,
          senderEmail,
          subject: parsedEmail.subject || "(No Subject)",
          body: parsedEmail.text || "(No Content)",
        })
        .returning();

      // Notify PostgreSQL
      await client.query(
        `NOTIFY new_email, '${JSON.stringify(insertedEmail[0])}'`,
      );

      console.log(`Email received for ${recipientEmail}`);
    } catch (error) {
      console.error("Error processing email:", error);
    }

    callback();
  },
});

// Start SMTP Server
smtpServer.listen(25, () => console.log("SMTP Server is running on port 25"));
