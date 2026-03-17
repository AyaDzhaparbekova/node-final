const { app } = require("../app");
const { seed_db, testUserPassword } = require("../util/seed_db");
const get_chai = require("../util/get_chai");
const Task = require("../models/Task");
const faker = require("@faker-js/faker").fakerEN_US;

describe("Task CRUD operations", function () {

  before(async function () {
    const { request } = await get_chai();

    this.test_user = await seed_db();

    let res = await request.execute(app).get("/sessions/logon").send();
    const textNoLineEnd = res.text.replaceAll("\n", "");
    this.csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd)[1];
    let cookies = res.headers["set-cookie"];
    this.sessionCookie = cookies.find((el) => el.startsWith("connect.sid"));

    res = await request
      .execute(app)
      .post("/sessions/logon")
      .set("Cookie", this.sessionCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .redirects(0)
      .send({
        email: this.test_user.email,
        password: testUserPassword,
        _csrf: this.csrfToken,
      });

    cookies = res.headers["set-cookie"];
    const newSession = cookies.find((el) => el.startsWith("connect.sid"));
    if (newSession) this.sessionCookie = newSession;

    res = await request
      .execute(app)
      .get("/tasks")
      .set("Cookie", this.sessionCookie)
      .send();
    const tasksPage = res.text.replaceAll("\n", "");
    const newCsrf = /_csrf\" value=\"(.*?)\"/.exec(tasksPage);
    if (newCsrf) this.csrfToken = newCsrf[1];
  });

  it("should get the task list with 20 entries", async function () {
    const { expect, request } = await get_chai();
    const res = await request
      .execute(app)
      .get("/tasks")
      .set("Cookie", this.sessionCookie)
      .send();
    expect(res).to.have.status(200);
    const count = (res.text.match(/class="task-item/g) || []).length;
    console.log("Task count found:", count);
    expect(count).to.equal(20);
  });

  it("should create a new task", async function () {
    const { expect, request } = await get_chai();
    const tasksBefore = await Task.find({ createdBy: this.test_user._id });

    await request
      .execute(app)
      .post("/tasks")
      .set("Cookie", this.sessionCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        title: faker.lorem.words(3),
        description: faker.lorem.sentence(),
        category: "other",
        dueDate: "2026-12-01",
        _csrf: this.csrfToken,
      });

    const tasksAfter = await Task.find({ createdBy: this.test_user._id });
    expect(tasksAfter.length).to.equal(tasksBefore.length + 1);
  });

});
