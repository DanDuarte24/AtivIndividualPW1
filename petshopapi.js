const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(express.json());

const petshops = [];

function isValidCNPJ(cnpj) {
    const regex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    return regex.test(cnpj);
}

// rotas

// cria um novo petshop
app.post('/petshops', (req, res) => {
    const { name, cnpj } = req.body;

    if (!name || !cnpj) {
        return res.status(400).json({ error: 'Name and CNPJ are required' });
    }

    if (!isValidCNPJ(cnpj)) {
        return res.status(400).json({ error: 'Invalid CNPJ format' });
    }

    const petshopExists = petshops.find(petshop => petshop.cnpj === cnpj);

    if (petshopExists) {
        return res.status(400).json({ error: 'Petshop with this CNPJ already exists' });
    }

    const petshop = {
        id: uuidv4(),
        name,
        cnpj,
        pets: []
    };

    petshops.push(petshop);

    return res.status(201).json(petshop);
});

// lista todos os pets
app.get('/pets', (req, res) => {
    const allPets = petshops.flatMap(petshop => petshop.pets);
    return res.json(allPets);
});

// adicionar um pet
app.post('/pets', (req, res) => {
    const { name, type, description, deadline_vaccination } = req.body;

    if (!name || !type || !description || !deadline_vaccination) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const newPet = {
        id: uuidv4(),
        name,
        type,
        description,
        vaccinated: false,
        deadline_vaccination: new Date(deadline_vaccination),
        created_at: new Date()
    };

    // Adiciona o pet ao "banco de dados"
    const defaultPetshop = petshops[0] || { id: uuidv4(), name: 'Default Petshop', cnpj: '00.000.000/0000-00', pets: [] };

    if (!petshops.includes(defaultPetshop)) {
        petshops.push(defaultPetshop);
    }

    defaultPetshop.pets.push(newPet);

    return res.status(201).json(newPet);
});

// atualizar dados de um pet
app.put('/pets/:id', (req, res) => {
    const { id } = req.params;
    const { name, type, description, deadline_vaccination } = req.body;

    const pet = petshops.flatMap(petshop => petshop.pets).find(pet => pet.id === id);

    if (!pet) {
        return res.status(404).json({ error: 'Pet not found' });
    }

    pet.name = name || pet.name;
    pet.type = type || pet.type;
    pet.description = description || pet.description;
    pet.deadline_vaccination = deadline_vaccination ? new Date(deadline_vaccination) : pet.deadline_vaccination;

    return res.json(pet);
});

// verificar se o pet foi vacinado
app.patch('/pets/:id/vaccinated', (req, res) => {
    const { id } = req.params;

    const pet = petshops.flatMap(petshop => petshop.pets).find(pet => pet.id === id);

    if (!pet) {
        return res.status(404).json({ error: 'Pet not found' });
    }

    pet.vaccinated = true;

    return res.json(pet);
});

// excluir um pet
app.delete('/pets/:id', (req, res) => {
    const { id } = req.params;

    const petshop = petshops.find(petshop => petshop.pets.some(pet => pet.id === id));

    if (!petshop) {
        return res.status(404).json({ error: 'Pet not found' });
    }

    const petIndex = petshop.pets.findIndex(pet => pet.id === id);

    if (petIndex === -1) {
        return res.status(404).json({ error: 'Pet not found' });
    }

    petshop.pets.splice(petIndex, 1);

    return res.status(200).json({ message: 'Pet removed successfully' });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
