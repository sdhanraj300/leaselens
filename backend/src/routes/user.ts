import { Response, Router } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/user - Get or creat e user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    
    let dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: { id: user.id, email: user.email!, credits: 5 }
      });
    }
    return res.json(dbUser);
  } catch (error) {
    console.error("User API Error:", error);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;
