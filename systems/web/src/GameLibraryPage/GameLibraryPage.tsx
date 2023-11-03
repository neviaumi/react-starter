import { gql, useQuery } from '@apollo/client';
import { Card, CardTitle } from '@busybox/react-components/Card';
import { Field } from '@busybox/react-components/Field';
import { Image } from '@busybox/react-components/Image';
import { Content, Main, Side } from '@busybox/react-components/Layout';
import { List, ListItem } from '@busybox/react-components/List';
import { Radio, RadioGroup } from '@busybox/react-components/RadioGroup';
import { useState } from 'react';

import AddGameToLibraryTrigger from './AddGameToLibraryForm.tsx';

interface Game {
  boxArtImageUrl: string;
  id: string;
  name: string;
  platform: string;
  publisher: string;
}

interface Data {
  gameList: { edges: { node: Game }[]; totalCount: number };
}

export default function GameLibraryPage() {
  const GET_GAME_LIST = gql`
    query queryGameList(
      $userId: ID
      $nextPageToken: String
      $limit: Int!
      $platform: String
    ) {
      gameList(
        userId: $userId
        nextPageToken: $nextPageToken
        limit: $limit
        platform: $platform
      ) {
        edges {
          node {
            id
            boxArtImageUrl
            platform
            name
            publisher
          }
        }
        pageInfo {
          hasNextPage
          nextPageToken
        }
      }
    }
  `;
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);
  const { data, error, loading, refetch } = useQuery<
    Data,
    {
      limit: number;
      platform?: string | null;
      userId: string;
    }
  >(GET_GAME_LIST, {
    variables: {
      limit: 65535,
      platform: platformFilter,
      userId: '1ec57d7a-67be-42d0-8a97-07e743e6efbc',
    },
  });

  async function setFilter(filters: { platform: string }) {
    setPlatformFilter(filters.platform === 'ALL' ? null : filters.platform);
    await refetch({
      platform: filters.platform === 'ALL' ? null : filters.platform,
    });
  }
  if (loading) {
    // TODO: https://github.com/davidNHK/react-components/issues/484
    return <div>Loading...</div>;
  }
  if (error) {
    // TODO: https://github.com/davidNHK/react-components/issues/525
    return <div>Error!</div>;
  }
  const platform = platformFilter ?? 'ALL';
  return (
    <Content className={'tw-flex tw-flex-row tw-justify-evenly'}>
      <Main>
        <h1>Saved games on {platform} platform</h1>
        <List>
          {data?.gameList.edges.map(({ node }) => (
            <ListItem key={node.id}>
              <Card
                className={'tw-flex tw-w-80 tw-justify-between'}
                data-testid={`game-container`}
              >
                <div className={'tw-inline-flex tw-items-center tw-gap-2'}>
                  <Image className={'tw-w-10'} src={node.boxArtImageUrl} />
                  <div className={'tw-flex tw-flex-col tw-content-between'}>
                    <CardTitle>{node.name}</CardTitle>
                    <p className={'tw-uppercase'}>{node.platform}</p>
                  </div>
                </div>
                <div
                  className={
                    'tw-inline-flex tw-items-center tw-justify-items-end'
                  }
                >
                  <p className={'tw-uppercase'}>{node.publisher}</p>
                </div>
              </Card>
            </ListItem>
          ))}
        </List>
      </Main>
      <Side>
        <AddGameToLibraryTrigger
          onGameCreatedOnLibrary={async gameCreated => {
            await setFilter({
              platform: gameCreated.platform,
            });
          }}
        />
        <Field
          onChange={e => {
            setFilter({
              platform: e.target.value,
            });
          }}
          value={platform}
        >
          <RadioGroup name={'platform'}>
            <label className={'tw-block'}>Filter</label>
            <Radio id={'ps4'} value={'PS4'}>
              PS4
            </Radio>
            <Radio id={'ps5'} value={'PS5'}>
              PS5
            </Radio>
            <Radio id={'all'} value={'ALL'}>
              ALL
            </Radio>
          </RadioGroup>
        </Field>
      </Side>
    </Content>
  );
}
