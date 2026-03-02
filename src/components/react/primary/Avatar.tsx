import React from 'react'

const cx = (...classes: Array<string | undefined | false | null>) => classes.filter(Boolean).join(' ')

type DivProps = React.HTMLAttributes<HTMLDivElement>

type AvatarProps = DivProps

type AvatarFallbackProps = DivProps

type AvatarImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  alt: string
}

export const Avatar = ({ className, ...props }: AvatarProps) => {
  return (
    <div
      data-slot="avatar"
      className={cx('relative flex shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  )
}

export const AvatarImage = ({ className, ...props }: AvatarImageProps) => {
  return (
    <img
      data-slot="avatar-image"
      className={cx('h-full w-full object-cover', className)}
      {...props}
    />
  )
}

export const AvatarFallback = ({ className, ...props }: AvatarFallbackProps) => {
  return (
    <div
      data-slot="avatar-fallback"
      className={cx('flex h-full w-full items-center justify-center rounded-full', className)}
      {...props}
    />
  )
}
