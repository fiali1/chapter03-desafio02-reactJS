import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  nextPost: Post;
  previousPost: Post;
}

export default function Post({
  post,
  nextPost,
  previousPost,
}: PostProps): JSX.Element {
  const router = useRouter();

  function formatDate(date: string, editDate: boolean): string {
    const formattedDate = !editDate
      ? format(new Date(date), 'dd MMM yyyy', {
          locale: ptBR,
        })
      : format(new Date(date), "dd MMM yyyy, 'às' p", {
          locale: ptBR,
        });
    return formattedDate;
  }

  function calcReadTime(): number {
    const wordsPerMinute = 200;
    const words = post.data.content.reduce((acc, curr) => {
      const body = RichText.asText(curr.body);

      const wordArray = body.split(' ');

      return acc + wordArray.length;
    }, 0);

    return Math.ceil(words / wordsPerMinute);
  }

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Header />
      <main className={styles.container}>
        <img src={post.data.banner.url} alt="" />
        <article className={styles.content}>
          <h1>{post.data.title}</h1>
          <div className={styles.infoContainer}>
            <div className={styles.infoRow}>
              <div>
                <FiCalendar size={20} />
                <p>{formatDate(post.first_publication_date, false)}</p>
              </div>
              <div>
                <FiUser size={20} />
                <p>{post.data.author}</p>
              </div>
              <div>
                <FiClock size={20} />
                <p>{calcReadTime()} min</p>
              </div>
            </div>
            <div className={styles.infoRow}>
              <p>
                <i>
                  *editado em {formatDate(post.last_publication_date, true)}
                </i>
              </p>
            </div>
          </div>
          <div className={styles.postBodyContainer}>
            {post.data.content.map(contentItem => (
              <div key={contentItem.heading} className={styles.postBodyContent}>
                <h2>{contentItem.heading}</h2>
                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(contentItem.body),
                  }}
                />
              </div>
            ))}
          </div>
        </article>
        <hr />
        <div className={styles.navContainer}>
          {previousPost ? (
            <Link href={`/post/${previousPost.uid}`}>
              <div className={styles.navPrevious}>
                <h5>Como utilizar Hooks</h5>
                <p>Post anterior</p>
              </div>
            </Link>
          ) : (
            <></>
          )}
          {nextPost ? (
            <Link href={`/post/${nextPost.uid}`}>
              <div className={styles.navNext}>
                <h5>Como utilizar Hooks</h5>
                <p>Proximo post</p>
              </div>
            </Link>
          ) : (
            <></>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'post')
  );

  const params = postsResponse.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths: params,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  const nextResponse = await prismic.query(
    // Replace `article` with your doc type
    Prismic.Predicates.at('document.type', 'post'),
    {
      pageSize: 1,
      after: response?.id,
      orderings: '[document.first_publication_date desc]',
    }
  );

  const prevResponse = await prismic.query(
    // Replace `article` with your doc type
    Prismic.Predicates.at('document.type', 'post'),
    {
      pageSize: 1,
      after: response?.id,
      orderings: '[document.first_publication_date]',
    }
  );

  const post = response || null;
  const nextPost = nextResponse?.results[0] || null;
  const previousPost = prevResponse?.results[0] || null;

  return {
    props: {
      post,
      nextPost,
      previousPost,
    },
  };
};
