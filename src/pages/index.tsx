import { useState } from 'react';
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const [results, setResults] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  function formatDate(date: string): string {
    const formattedDate = format(new Date(date), 'dd MMM yyyy', {
      locale: ptBR,
    });

    return formattedDate;
  }

  function handleLoadMorePosts(): void {
    fetch(postsPagination.next_page)
      .then(response => response.json())
      .then(data => {
        setResults(results.concat(data.results));
        setNextPage(data.next_page);
      });
  }

  return (
    <>
      <main>
        <div className={styles.container}>
          <div className={styles.logoContainer}>
            <img src="/images/logo.svg" alt="logo" />
          </div>
          {results.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <div className={styles.content}>
                <div className={styles.description}>
                  <h1>{post.data.title}</h1>
                  <p>{post.data.subtitle}</p>
                </div>
                <div className={styles.info}>
                  <div>
                    <FiCalendar />
                    <p>{formatDate(post.first_publication_date)}</p>
                  </div>
                  <div>
                    <FiUser />
                    <p>{post.data.author}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {nextPage && (
            <div className={styles.loadMore}>
              <button type="button" onClick={handleLoadMorePosts}>
                Carregar mais posts
              </button>
            </div>
          )}
          {preview && (
            <aside>
              <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
              </Link>
            </aside>
          )}
        </div>
        <script
          src="https://utteranc.es/client.js"
          repo="fiali1/chapter03-desafio02-reactJS"
          issue-term="pathname"
          theme="github-dark"
          crossOrigin="anonymous"
          async
        />
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    {
      ref: previewData?.ref ?? null,
    }
  );

  return {
    props: {
      postsPagination: postsResponse,
      preview,
    },
  };
};
