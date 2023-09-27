'use client';

import React, { useState, useEffect } from 'react';
import styles from '../../styles/profile.module.css'

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // 스크롤 이벤트 핸들러
  const handleScroll = () => {
    if (window.scrollY > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // 페이지가 로드될 때와 스크롤 이벤트를 등록합니다.
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    // 컴포넌트가 언마운트될 때 이벤트 리스너를 해제합니다.
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 페이지 맨 위로 스크롤하는 함수
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // 부드러운 스크롤 효과
    });
  };

  return (
    <div>
      {/* isVisible이 true일 때만 버튼이 나타납니다. */}
      {isVisible && (
        <button className={styles.backToTop} onClick={scrollToTop}>
          ↑
        </button>
      )}
    </div>
  );
};

export default BackToTop;