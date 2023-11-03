import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Game {
  @Field(() => ID)
  id!: string;

  @Field()
  numberOfPlayers!: number;

  @Field()
  platform!: string;

  @Field()
  publisher!: string;

  @Field()
  name!: string;

  @Field()
  genre!: string;

  @Field()
  releaseDate!: Date;

  @Field({
    nullable: true,
  })
  boxArtImageUrl?: string;

  @Field()
  updatedAt!: Date;

  @Field()
  createdAt!: Date;
}

@ObjectType()
class GameNode {
  @Field()
  node!: Game;
}

@ObjectType()
class PageInfo {
  @Field()
  hasNextPage!: boolean;

  @Field({
    nullable: true,
  })
  nextPageToken?: string;
}

@ObjectType()
export class GameList {
  @Field(() => [GameNode])
  edges!: GameNode[];

  @Field(() => PageInfo)
  pageInfo!: PageInfo;
}
