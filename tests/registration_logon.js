const { app } = require("../app");
const faker = require("@faker-js/faker").fakerEN_US;
const get_chai = require("../util/get_chai");
const User = require("../models/User");

describe("tests for registration and logon", function () {

  it("should get the registration page", async () => {
    const { expect, request } = await get_chai();
    const res = await request.execute(app).get("/sessions/register").send();
    expect(res).to.have.status(200);
    const textNoLineEnd = res.text.replaceAll("\n", "");
    const csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd);
    expect(csrfToken).to.not.be.null;
    this.csrfToken = csrfToken[1];
   
    const cookies = res.headers["set-cookie"];
    this.sessionCookie = cookies.find((el) => el.startsWith("connect.sid"));
    expect(this.sessionCookie).to.not.be.undefined;
  });

  it("should register the user", async () => {
    const { expect, request } = await get_chai();
    this.password = faker.internet.password();
    this.user = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
    };
    const res = await request
      .execute(app)
      .post("/sessions/register")
      .set("Cookie", this.sessionCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        name: this.user.name,
        email: this.user.email,
        password: this.password,
        password1: this.password,
        _csrf: this.csrfToken,
      });
    expect(res).to.have.status(200);
    const newUser = await User.findOne({ email: this.user.email });
    expect(newUser).to.not.be.null;
  });

  it("should log the user on", async () => {
    const { expect, request } = await get_chai();
    const res = await request
      .execute(app)
      .post("/sessions/logon")
      .set("Cookie", this.sessionCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .redirects(0)
      .send({
        email: this.user.email,
        password: this.password,
        _csrf: this.csrfToken,
      });
    expect(res).to.have.status(302);
    const cookies = res.headers["set-cookie"];
    const newSession = cookies.find((el) => el.startsWith("connect.sid"));
    if (newSession) this.sessionCookie = newSession;
    expect(this.sessionCookie).to.not.be.undefined;
  });

});