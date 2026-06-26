import prisma from './src/lib/prisma';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

async function main() {
  console.log('Seeding database with sample data...');

  const defaultPasswordStr = 'password123';
  const hashedPassword = bcrypt.hashSync(defaultPasswordStr, 10);
  
  const parseCSV = (filePath: string) => {
    const content = fs.readFileSync(path.resolve(process.cwd(), '..', filePath), 'utf-8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const obj: any = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] ? values[i].trim() : null;
      });
      return obj;
    });
  };

  try {
    const studentsData = parseCSV('students_sample.csv');
    console.log(`Parsed ${studentsData.length} students. Seeding...`);
    
    const studentsToInsert = studentsData.map(s => ({
      name: s.name,
      email: s.email,
      password: hashedPassword,
      role: 'STUDENT' as const,
      roll_no: s.roll_no,
      department: s.department
    }));
    
    const CHUNK_SIZE = 500;
    for (let i = 0; i < studentsToInsert.length; i += CHUNK_SIZE) {
      await prisma.user.createMany({
        data: studentsToInsert.slice(i, i + CHUNK_SIZE),
        skipDuplicates: true
      });
    }
    console.log('Students seeded successfully!');

    const facultyData = parseCSV('faculty_sample.csv');
    console.log(`Parsed ${facultyData.length} faculty. Seeding...`);
    
    const facultyToInsert = facultyData.map(f => ({
      name: f.name,
      email: f.email,
      password: hashedPassword,
      role: 'FACULTY' as const,
      department: f.department
    }));
    
    for (let i = 0; i < facultyToInsert.length; i += CHUNK_SIZE) {
      await prisma.user.createMany({
        data: facultyToInsert.slice(i, i + CHUNK_SIZE),
        skipDuplicates: true
      });
    }
    console.log('Faculty seeded successfully!');

    const coordsData = parseCSV('coordinators_sample.csv');
    console.log(`Parsed ${coordsData.length} coordinators. Seeding...`);
    
    for (const c of coordsData) {
      const user = await prisma.user.upsert({
        where: { email: c.email },
        update: {},
        create: {
          name: c.name,
          email: c.email,
          password: hashedPassword,
          role: 'COORDINATOR' as const,
        }
      });
      
      if (c.club_name) {
        await prisma.club.upsert({
          where: { name: c.club_name },
          update: { headId: user.id },
          create: {
            name: c.club_name,
            headId: user.id
          }
        });
      }
    }
    console.log('Coordinators and Clubs seeded successfully!');

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
