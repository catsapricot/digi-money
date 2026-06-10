import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch notifications for the logged-in user
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: parseInt(userId, 10) },
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

// PUT: Mark notification(s) as read
export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body; // Optional: specific notification ID. If not provided, marks all as read.

    if (id) {
      const existing = await prisma.notification.findFirst({
        where: { id: parseInt(id, 10), userId: parseInt(userId, 10) },
      });

      if (!existing) {
        return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
      }

      const updated = await prisma.notification.update({
        where: { id: parseInt(id, 10) },
        data: { dibaca: true },
      });

      return NextResponse.json({ message: 'Notification marked as read', notification: updated });
    } else {
      // Mark all as read for this user
      await prisma.notification.updateMany({
        where: { userId: parseInt(userId, 10), dibaca: false },
        data: { dibaca: true },
      });

      return NextResponse.json({ message: 'All notifications marked as read' });
    }
  } catch (error: any) {
    console.error('Update notification error:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
