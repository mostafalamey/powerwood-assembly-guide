import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import { forwardRef, MouseEvent, ReactNode } from "react";

interface TransitionLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  title?: string;
  target?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * A Link component that wraps navigation with the View Transitions API
 * for smooth page transitions. Falls back to normal navigation if
 * View Transitions API is not supported.
 */
const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  ({ children, className, title, target, onClick, href, ...props }, ref) => {
    const router = useRouter();

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      // Call any existing onClick handler
      onClick?.(e);

      // Don't intercept if:
      // - Default was prevented
      // - Opening in new tab (target="_blank")
      // - Using modifier keys (ctrl/cmd click)
      // - View Transitions API not supported
      if (
        e.defaultPrevented ||
        target === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        !("startViewTransition" in document)
      ) {
        return;
      }

      e.preventDefault();

      const url = typeof href === "string" ? href : href.pathname || "/";

      // Use View Transitions API for smooth transition
      (document as any).startViewTransition(async () => {
        await router.push(href);
      });
    };

    return (
      <Link
        ref={ref}
        href={href}
        className={className}
        title={title}
        target={target}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Link>
    );
  },
);

TransitionLink.displayName = "TransitionLink";

export default TransitionLink;
