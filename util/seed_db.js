const Task = require("../models/Task");
const User = require("../models/User");
const faker = require("@faker-js/faker").fakerEN_US;
require("dotenv").config();

const testUserPassword = faker.internet.password();

const seed_db = async () => {
  try {
    await Task.deleteMany({});
    await User.deleteMany({});

 
    const testUser = await User.create({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: testUserPassword,
    });

    const tasks = Array.from({ length: 20 }, () => ({
      title: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      category: ["doctor", "club", "sport", "homework", "other"][Math.floor(5 * Math.random())],
      status: ["todo", "in progress", "done"][Math.floor(3 * Math.random())],
      dueDate: faker.date.future(),
      isPrivate: Math.random() > 0.5,
      createdBy: testUser._id,
    }));

    await Task.insertMany(tasks);
    return testUser;
  } catch (e) {
    console.log("database seed error:", e.message);
    throw e;
  }
};

module.exports = { testUserPassword, seed_db };
