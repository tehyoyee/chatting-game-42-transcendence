'use client'

import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const ([login, setLogin]) = useState([false]);

  return (
  	<Login />
  );
}
