import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateUserInput, CreateUserOutput } from "./dtos/create-user.dto";
import { User } from "./entities/users.entity";
import { UsersService } from "./users.service";
import { LoginOutput, LoginInput } from "./dtos/login.dto";
import { UseGuards } from "@nestjs/common";
import { AuthorizationGuard } from "src/authorization/authorization.guard";
import { AuthUser } from "src/authorization/auth-user.decorator";
import { GetUsersOutput } from "./dtos/get-users.dto";
import { GetUserInput, GetUserOutput } from "./dtos/get-user.dto";
import { UpdateUserInput, UpdateUserOutput } from "./dtos/update-user.dto";
import { DeleteUserInput, DeleteUserOutput } from "./dtos/delete-user.dto";

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query((returns) => GetUsersOutput)
  users() {
    return this.usersService.users();
  }

  @Query((returns) => GetUserOutput)
  async user(@Args("input") getUserInput: GetUserInput) {
    return this.usersService.findUserById(getUserInput);
  }

  @Query((returns) => User)
  @UseGuards(AuthorizationGuard)
  myProfile(@AuthUser() User: User) {
    return User;
  }

  @Query((returns) => LoginOutput)
  async login(@Args("input") loginInput: LoginInput) {
    return await this.usersService.login(loginInput);
  }

  @Mutation((returns) => CreateUserOutput)
  async createUser(@Args("input") CreateUserInput: CreateUserInput) {
    return await this.usersService.createUser(CreateUserInput);
  }

  @Mutation((returns) => UpdateUserOutput)
  @UseGuards(AuthorizationGuard)
  async updateUser(
    @AuthUser() { id }: User,
    @Args("input") UpdateUserInput: UpdateUserInput
  ): Promise<UpdateUserOutput> {
    return this.usersService.updateUser(id, UpdateUserInput);
  }

  @Mutation((returns) => DeleteUserOutput)
  async deleteUser(@Args("input") deleteUserInput: DeleteUserInput) {
    return await this.usersService.deleteUserById(deleteUserInput);
  }
}
