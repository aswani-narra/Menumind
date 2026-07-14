import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import profilePicture from './assets/profile-picture.png';
import FavoriteCard from './FavoriteCard';
import './Profile.css';
import { apiUrl } from './api';

const Profile = () => {
    // State hooks for profile fields
    const [selectedRestrictions, setSelectedRestrictions] = useState([]);
    const [selectedCuisines, setSelectedCuisines] = useState([]);
    const [budget, setBudget] = useState('');
    const [numOfMeals, setNumOfMeals] = useState(7);
    const [cookingTime, setCookingTime] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // State to store favorite meals fetched from the API
    const [favoriteMeals, setFavoriteMeals] = useState([]);

    // Function to handle changes in dietary restrictions dropdown
    const handleSelectChange = (e) => {
        const options = e.target.options;
        const selectedValues = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }
        setSelectedRestrictions(selectedValues);
    };

    // Function to handle changes in favorite cuisines dropdown
    const handleCuisinesSelectChange = (e) => {
        const options = e.target.options;
        const selectedValues = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }
        setSelectedCuisines(selectedValues);
    };

    // Effect to fetch profile data & favorite meals from the API
    useEffect(() => {
        // Load profile from database
        fetch(apiUrl('/profile/getProfile'))
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Failed to load profile');
            })
            .then(data => {
                if (data) {
                    if (data.cuisine) {
                        setSelectedCuisines(data.cuisine.split(',').map(c => c.trim()).filter(Boolean));
                    }
                    if (data.dietaryRestrictions) {
                        setSelectedRestrictions(data.dietaryRestrictions.split(',').map(r => r.trim()).filter(Boolean));
                    }
                    setBudget(data.budget || '');
                    setNumOfMeals(data.numOfMeals || 7);
                    setCookingTime(data.cookingTime || '');
                }
            })
            .catch(err => console.error('Error fetching profile:', err));

        // Load favorite meals
        fetch(apiUrl('/meals/getAllFavoriteMeals'))
            .then(response => { if (!response.ok) throw new Error('Failed to fetch meals'); return response.json(); })
            .then(data => setFavoriteMeals(data))
            .catch(err => console.error('Error fetching favorite meals:', err));
    }, []);

    // Function to save profile data to backend
    const handleSaveProfile = () => {
        setIsSaving(true);
        fetch(apiUrl('/profile/setProfile'), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cuisine: selectedCuisines.join(', '),
                budget: budget,
                numOfMeals: parseInt(numOfMeals, 10) || 7,
                cookingTime: cookingTime,
                dietaryRestrictions: selectedRestrictions.join(', ')
            })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Failed to save profile');
        })
        .then(data => {
            setIsSaving(false);
            alert('Profile saved successfully!');
        })
        .catch(err => {
            setIsSaving(false);
            console.error('Error saving profile:', err);
            alert('Failed to save profile: ' + err.message);
        });
    };

    return (
        <Container className="mt-5 mb-5">
            <Row className="justify-content-center align-items-center">
                <Col xs={12} md={10}>
                    <Card style={{ boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px' }}>
                    <Card.Header style={{backgroundColor: '#7851A9', color: "white", textAlign: 'center', fontWeight: 'bold'}}>User Profile</Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={4} className="text-center d-flex flex-column align-items-center justify-content-center">
                                    <img src={profilePicture} alt="Profile" className="img-fluid rounded-circle mb-3" style={{ boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px', width: '150px' }} />
                                    <h2 className="font-weight-bold">John Doe</h2>
                                </Col>
                                <Col md={8} className="text-start">
                                    <Form.Group className="mb-3">
                                        <label style={{fontWeight:'bold', display: 'block', marginBottom: '5px'}}>Dietary Restrictions</label>
                                        <Form.Control as="select" multiple onChange={handleSelectChange} value={selectedRestrictions} style={{height: '100px'}}>
                                            <option value="vegetarian">Vegetarian</option>
                                            <option value="vegan">Vegan</option>
                                            <option value="glutenFree">Gluten-Free</option>
                                            <option value="dairyFree">Dairy-Free</option>
                                            <option value="nutFree">Nut-Free</option>
                                        </Form.Control>
                                    </Form.Group>
                                    
                                    <Form.Group className="mb-3">
                                        <label style={{fontWeight:'bold', display: 'block', marginBottom: '5px'}}>Favorite Cuisines</label>
                                        <Form.Control as="select" multiple onChange={handleCuisinesSelectChange} value={selectedCuisines} style={{height: '100px'}}>
                                            <option value="italian">Italian</option>
                                            <option value="mexican">Mexican</option>
                                            <option value="japanese">Japanese</option>
                                            <option value="indian">Indian</option>
                                            <option value="nigerian">Nigerian</option>
                                            <option value="slovenian">Slovenian</option>
                                        </Form.Control>
                                    </Form.Group>

                                    <Row>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <label style={{fontWeight:'bold', display: 'block', marginBottom: '5px'}}>Budget</label>
                                                <Form.Control as="select" value={budget} onChange={(e) => setBudget(e.target.value)}>
                                                    <option value="">Select...</option>
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                </Form.Control>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <label style={{fontWeight:'bold', display: 'block', marginBottom: '5px'}}>Number of Meals</label>
                                                <Form.Control type="number" min="1" max="21" value={numOfMeals} onChange={(e) => setNumOfMeals(e.target.value)} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <label style={{fontWeight:'bold', display: 'block', marginBottom: '5px'}}>Cooking Time</label>
                                                <Form.Control as="select" value={cookingTime} onChange={(e) => setCookingTime(e.target.value)}>
                                                    <option value="">Select...</option>
                                                    <option value="quick">Quick (&lt;30m)</option>
                                                    <option value="medium">Medium (30-60m)</option>
                                                    <option value="long">Long (&gt;60m)</option>
                                                </Form.Control>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <div className="text-center mt-4">
                                        <button className="btn btn-primary btn-lg" onClick={handleSaveProfile} disabled={isSaving} style={{backgroundColor: '#7851A9', color: "white", padding: '10px 40px', fontWeight: 'bold'}}>
                                            {isSaving ? 'Saving...' : 'Save Profile'}
                                        </button>
                                    </div>
                                </Col>
                            </Row>
                            {/* Food Cards */}
                            <h4 className="mt-5 mb-3" style={{fontWeight: 'bold', borderBottom: '2px solid #7851A9', paddingBottom: '5px'}}>Favorite Meals</h4>
                            <Row className="mt-3">
                                <Col>
                                    <div className="food-cards-container d-flex overflow-x-auto">
                                    {favoriteMeals.length > 0 ? (
                                        favoriteMeals.map((meal, index) => (
                                            meal && (
                                                <div key={index} className="food-card mr-3" style={{ marginRight: '10px'}}>
                                                    <FavoriteCard
                                                        food={meal}
                                                    />
                                                </div>
                                            )
                                        ))
                                    ) : (
                                        <p className="text-muted">No favorite meals added yet. Swipe right on generated meals to add favorites!</p>
                                    )}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Profile;
