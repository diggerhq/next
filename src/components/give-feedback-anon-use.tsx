"use client";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/utils/cn';
import Link from 'next/link';
import { useState } from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
}

export const GiveFeedbackAnonUser = ({ children, className }: Props) => {
  const [isOpen, setIsOpen] = useState(false);


  return (
    <Dialog
      open={isOpen}
      onOpenChange={(newIsOpen) => {
        setIsOpen(newIsOpen);
      }}
    >
      <DialogTrigger className={cn('w-full', className)} asChild>
        {children ? children : <Button variant="default">Give Feedback</Button>}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <div>
            <DialogTitle className="text-lg flex gap-2 items-start">Please login to continue</DialogTitle>
            <DialogDescription className="text-base">
              You will be able to give us feedback after you login
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className='flex gap-2 justify-end'>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>

          <Link href="/login" className="w-full lg:w-fit">
            <Button
              variant="default"
            >
              Log In
            </Button>
          </Link>
        </div>

      </DialogContent>
    </Dialog >
  )
}
