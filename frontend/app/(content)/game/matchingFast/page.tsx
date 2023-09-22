// 'use client';

import Image from 'next/image';
// import styles from '@/styles/profile.module.css'
import styles from '@/styles/matching.module.css'
import Link from 'next/link';
// import d from '/frontend/public/default.png'
import { useAuthContext } from '@/components/user/auth';
import { useEffect, useState } from 'react';
import MatchingFast from '@/components/content/matchingFast';
export default function Page() {

  return (
  <>
    <MatchingFast></MatchingFast>
  </>
  );
}
