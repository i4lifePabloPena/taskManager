require('dotenv').config();
const connectDB = require('./config/db.js');
const User = require('./models/user.model.js');

const [username, password,name , email] = process.argv.slice(2);

if (!username || !password) {
  console.error('Error: node ./create-admin.js <username> <password> [Nombre] [Correo] ');
  process.exit(1);
}

const createAdminUser = async () => {
  try {
    await connectDB();

    const adminUser = new User({
      username,
      password,
      email,
      name,
      admin: true,
      createdAt: new Date(),
    });

    await adminUser.save();
    console.log(`Usuario admin '${username}' creado correctamente.`);
    process.exit(0);
  } catch (error) {
    console.error('Error al crear el usuario admin:', error.message || error);
    process.exit(1);
  }
};

createAdminUser();
