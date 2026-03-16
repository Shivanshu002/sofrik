import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI!;

const UserSchema = new mongoose.Schema({ email: String, password: String, name: String }, { timestamps: true });
const ProjectSchema = new mongoose.Schema({ title: String, description: String, status: String, owner: mongoose.Schema.Types.ObjectId }, { timestamps: true });
const TaskSchema = new mongoose.Schema({ title: String, description: String, status: String, dueDate: Date, project: mongoose.Schema.Types.ObjectId, owner: mongoose.Schema.Types.ObjectId }, { timestamps: true });

const UserModel = mongoose.model('User', UserSchema);
const ProjectModel = mongoose.model('Project', ProjectSchema);
const TaskModel = mongoose.model('Task', TaskSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  await UserModel.deleteMany({ email: 'test@example.com' });

  const hashed = await bcrypt.hash('Test@123', 10);
  const user = await UserModel.create({ name: 'Test User', email: 'test@example.com', password: hashed });
  console.log('Created user: test@example.com / Test@123');

  const projects = await ProjectModel.insertMany([
    { title: 'Website Redesign', description: 'Redesign the company website with modern UI', status: 'active', owner: user._id },
    { title: 'Mobile App MVP', description: 'Build the first version of the mobile application', status: 'active', owner: user._id },
  ]);
  console.log(`Created ${projects.length} projects`);

  const tasks = [
    { title: 'Design wireframes', description: 'Create wireframes for all pages', status: 'done', dueDate: new Date('2025-07-10'), project: projects[0]._id, owner: user._id },
    { title: 'Setup React project', description: 'Initialize project with TypeScript and Tailwind', status: 'in-progress', dueDate: new Date('2025-07-20'), project: projects[0]._id, owner: user._id },
    { title: 'Implement homepage', description: 'Build the homepage component', status: 'todo', dueDate: new Date('2025-07-30'), project: projects[0]._id, owner: user._id },
    { title: 'Define API contracts', description: 'Document all API endpoints', status: 'done', dueDate: new Date('2025-07-05'), project: projects[1]._id, owner: user._id },
    { title: 'Setup NestJS backend', description: 'Initialize backend with auth and DB', status: 'in-progress', dueDate: new Date('2025-07-15'), project: projects[1]._id, owner: user._id },
    { title: 'Build login screen', description: 'Implement login and register screens', status: 'todo', dueDate: new Date('2025-07-25'), project: projects[1]._id, owner: user._id },
  ];

  await TaskModel.insertMany(tasks);
  console.log(`Created ${tasks.length} tasks`);
  console.log('Seeding complete!');
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
