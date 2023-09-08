import { redirect } from 'next/navigation';

export default function Home() {
  let login = false;

  if (login === false) {
    redirect("/login");
  }
  else {
    redirect("/content");
  }
}
