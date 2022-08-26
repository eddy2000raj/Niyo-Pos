import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

const TabLink = ({ children, href, ...props }) => {
  const router = useRouter();
  let className = children.props.className || '';
  if (router.pathname === href) {
    className = `${className} active`;
  }

  return (
    <Link href={href} {...props}>
      {React.cloneElement(children, { className })}
    </Link>
  );
};

export default TabLink;
