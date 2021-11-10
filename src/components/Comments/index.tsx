import { Component } from 'react';

import styles from './comments.module.scss';

export default class Comments extends Component {
  componentDidMount(): void {
    const script = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-uterances');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', '');
    script.setAttribute('repo', 'fiali1/chapter03-desafio02-reactJS');
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'github-dark');
    anchor.appendChild(script);
  }

  render(): JSX.Element {
    return (
      <div
        id="inject-comments-for-uterances"
        className={styles.commentsContainer}
      />
    );
  }
}
