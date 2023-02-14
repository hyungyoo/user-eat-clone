import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { DataSource, Repository } from "typeorm";
import * as request from "supertest";
import { User } from "src/users/entities/users.entity";
import { EmailVerification } from "src/email/entities/email.verification.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JWT } from "src/jwt/consts/jwt.consts";

/**
 * for mocking mailgun
 */
jest.mock("mailgun-js", () => {
  const mMailgun = {
    messages: jest.fn().mockReturnThis(),
    send: jest.fn(() => "mock test send mail fn"),
  };
  return jest.fn(() => mMailgun);
});

/**
 * url
 */
const URL = "/graphql";

/**
 * dummy for test
 */
const dummy = {
  email: "dummy@test.com",
  password: "12345",
  name: "dummy",
  role: "CLIENT",
};

/**
 * User resolver testing e2e
 */
describe("Users resolver test (e2e)", () => {
  let app: INestApplication;

  /**
   * repositorty for get data
   */
  let userRepository: Repository<User>;
  let emailVerificationRepository: Repository<EmailVerification>;

  /**
   * funtion for request
   * @param query query for send
   * @returns request result
   */
  const coreRequest = () => {
    return request(app.getHttpServer()).post(URL);
  };
  const postRequest = (query: string, jwtToken?: string | undefined) => {
    return jwtToken
      ? coreRequest().set(JWT, jwtToken).send({ query })
      : coreRequest().send({ query });
  };

  /**
   * setting before test
   * get app, userRepository and emailVerificationRepository from moduleRef
   * app initial
   */
  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    userRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    emailVerificationRepository = moduleRef.get<Repository<EmailVerification>>(
      getRepositoryToken(EmailVerification)
    );
    await app.init();
  });

  /**
   * for drop the database,
   * and close app after e2e test
   */
  afterAll(async () => {
    const dataSource = new DataSource({
      type: "postgres",
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    });
    const connection = await dataSource.initialize();
    await connection.dropDatabase();
    await connection.destroy();
    app.close();
  });

  describe("createUser", () => {
    const gqlQeury = `
    mutation {
      createUser(
        input: {
          name: "${dummy.name}",
          email: "${dummy.email}"
          password: "${dummy.password}"
          role: ${dummy.role}
        }
      ) {
        isOk
        errorMessage
        emailVerified {
          id
          verificationCode
          user {
            id
            email
            name
            role
          }
        }
      }
    }
    `;
    it("should create user", async () => {
      return postRequest(gqlQeury)
        .expect(200)
        .expect(async (res) => {
          // console.log(res.body);
          const {
            body: {
              data: {
                createUser: { isOk, errorMessage, emailVerified },
              },
            },
          } = res;
          expect(isOk).toBeTruthy();
          expect(errorMessage).toBeNull();
          expect(emailVerified.user.email).toBe(dummy.email);
          expect(emailVerified.user.name).toBe(dummy.name);
          expect(emailVerified.user.role).toBe(dummy.role);
          expect(emailVerified.verificationCode).toBeDefined();
        });
    });
    it("should fail create user with email exists", async () => {
      return postRequest(gqlQeury)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                createUser: { isOk, errorMessage, emailVerified },
              },
            },
          } = res;
          expect(isOk).toBeFalsy();
          expect(errorMessage).toBe("this email already exists");
          expect(emailVerified).toBeNull();
        });
    });
  });
  it.todo("verifierEmailCode");
  it.todo("users");
  it.todo("user");
  it.todo("myProfile");
  it.todo("login");
  it.todo("updateUser");
  it.todo("deleteUser");
});
