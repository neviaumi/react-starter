import { ArgsType, Field, ID, Int } from '@nestjs/graphql';
import { IsOptional, Max, Min } from 'class-validator';

@ArgsType()
export class GetGameListArgs {
  @Field({ nullable: true })
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  platform?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  userId?: string;

  @Field({ nullable: true })
  @IsOptional()
  nextPageToken?: string;

  @Field(() => Int, { nullable: true })
  @Min(0)
  @Max(65535)
  @IsOptional()
  limit = 10;
}
