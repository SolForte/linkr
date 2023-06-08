import React, { useEffect, useState } from 'react';
import useInterval from 'use-interval';
import { BiRefresh } from 'react-icons/bi';
import {
  MainStyled,
  PageContainerStyled,
  SectionStyled,
  PostsStyled,
  UpdateButton,
} from './styled';
import ScrollIndicator from '../../components/ScrollIndicator';
import { LoaderStyled, TitleH2Styled } from '../../styled';
import CreatePost from '../../components/CreatePost';
import Header from '../../components/Header';
import { useMutation } from '../../hooks/request.hooks';
import usePostsPagination from '../../hooks/posts.hooks';
import { getUserFollowers, publishPost } from '../../services/api/timeline.services';
import PostsList from '../../components/PostsList';
import TrendingStyled from '../../components/Trending';
import client from '../../services/api/api.client';

export default function Timeline() {
  const [updatedPosts, setUpdatedPosts] = useState([]);

  const {
    data: posts,
    loading: loadingPosts,
    error: errorPosts,
    refresh: refreshPosts,
    nextPage,
  } = usePostsPagination(10);

  const { mutate: publish, loading: loadingPublish } = useMutation(publishPost);

  const handlePostSubmit = (event) => {
    event.preventDefault();
    const url = event.target.url.value;
    const description = event.target.description.value;

    publish({
      url,
      description,
      onSuccess: () => {
        refreshPosts();
        event.target.reset();
      },
      onError: () => {
        alert('There was an error publishing your link');
      },
    });
  };

  const loadingNewPosts = loadingPosts && posts?.length;

  const handleUpdatePosts = (event) => {
    event.preventDefault();
    refreshPosts();
  };

  useInterval(() => {
    client.get('/posts').then((res) => {
      if (res.data.length !== posts.length) {
        setUpdatedPosts(res.data);
      }
    });
  }, 15000);

  const [followedUsers, setFollowedUsers] = useState([]);

  const fetchFollowedUsers = async () => {
    try {
      const users = await getUserFollowers();
      setFollowedUsers(users);
    } catch {
      alert('Não foi possível carregar a timeline');
    }
  };

  useEffect(() => {
    fetchFollowedUsers();
  }, []);

  return (
    <>
      <Header followedUsers={followedUsers} />
      <PageContainerStyled>
        <MainStyled>
          <TitleH2Styled>timeline</TitleH2Styled>
          <SectionStyled>
            <PostsStyled>
              <UpdateButton
                update={posts && updatedPosts.length - posts.length > 0 && !NaN}
                onClick={handleUpdatePosts}
              >
                {posts && updatedPosts.length - posts.length > 0 && !NaN ? (
                  <p>
                    {updatedPosts.length - posts.length}
                    {' '}
                    new posts, load more!
                    <BiRefresh />
                  </p>
                ) : (
                  ''
                )}
              </UpdateButton>
              <CreatePost
                loading={loadingPublish}
                onSubmit={handlePostSubmit}
              />
              <PostsList
                posts={posts}
                error={errorPosts}
                loading={loadingPosts}
                refreshPosts={refreshPosts}
                followedUsers={followedUsers}
                page="timeline"
              />
              {posts?.length && <ScrollIndicator onIntersection={nextPage} />}
              {loadingNewPosts && <LoaderStyled />}
            </PostsStyled>
            <TrendingStyled posts={posts} />
          </SectionStyled>
        </MainStyled>
      </PageContainerStyled>
    </>
  );
}
