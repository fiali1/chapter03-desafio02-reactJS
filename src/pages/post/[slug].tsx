import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticPathsResult, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import PrismicDOM from 'prismic-dom';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
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
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  function formatDate(date: string): string {
    const formattedDate = format(new Date(date), 'dd MMM yyyy', {
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
          <div className={styles.info}>
            <div>
              <FiCalendar size={20} />
              <p>{formatDate(post.first_publication_date)}</p>
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

  return {
    props: {
      post: response,
    },
  };
};
