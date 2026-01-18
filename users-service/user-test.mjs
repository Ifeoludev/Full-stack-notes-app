import * as Users from "./users-sequelize.mjs";

async function testusers() {
  try {
    try {
      await Users.destroy("david");
    } catch (e) {
      /* ignore if not exists */
    }
    console.log("Creating user 'david'...");
    await Users.create(
      "david",
      "secret",
      "local",
      "David",
      "Pollock",
      "Middle",
      ["david@example.com"],
      []
    );

    console.log("Finding user 'david'...");
    const user = await Users.find("david");
    console.log("Found user:", user);

    console.log("Checking password 'secret' (should be true)...");
    const check1 = await Users.userPasswordCheck("david", "secret");
    console.log("Check result:", check1);

    console.log("Checking password 'wrong' (should be false)...");
    const check2 = await Users.userPasswordCheck("david", "wrong");
    console.log("Check result:", check2);

    console.log("Listing users...");
    const list = await Users.listUsers();
    console.log("Users:", list);

    console.log("Destroying user 'david'...");
    await Users.destroy("david");
    console.log("User destroyed.");

    Users.close();
  } catch (e) {
    console.error("Error:", e);
    Users.close();
  }
}

testusers();
