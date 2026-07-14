import React, { useState } from 'react';
import { Container, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import UploadPicture from './UploadPicture';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from './api';

class IngredientList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ingredients: [
        { name: "Flour", quantity: "2 cups", expirationDate: "2024-05-01" },
        { name: "Sugar", quantity: "1 cup", expirationDate: "2024-04-15" },
        { name: "Eggs", quantity: "4", expirationDate: "2024-04-30" },
        // Add more ingredients as needed
      ],
    };

    
  }

  componentDidMount() {
    // Call your API to get initial data
    this.fetchIngredients();
    
    // Set up interval to periodically refresh data
    this.interval = setInterval(this.fetchIngredients, 5000);
  }

  componentWillUnmount() {
    // Clear the interval when the component is unmounted
    clearInterval(this.interval);
  }

  fetchIngredients = async () => {
    try {
      // Make API call to fetch updated data
      const response = await fetch(apiUrl('/meals/getIngredientsList'));
      if (!response.ok) {
        throw new Error('Failed to fetch ingredients');
      }
      const data = await response.json();

      
      
      // Check if the data is an array
      if (Array.isArray(data)) {
        // Update state with new data
        this.setState({ ingredients: data });
      } else {
        throw new Error('Invalid data format: Expected an array');
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  }
  

  render() {
    const { ingredients } = this.state;
    const showScroll = ingredients.length > 10;

    return (
      <div className="container" style={{ maxHeight: '500px', overflowY: showScroll ? 'auto' : 'visible', textAlign: 'center', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px'}}>
        <h2>Ingredients List</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Buy Date</th>
              <th>Expiration Date</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.filter((x) => x.name && x.name.length < 15).map((ingredient, index) => (
              <tr key={index}>
                <td style={{ textAlign: 'center' }}>{ingredient.name}</td>
                <td style={{ textAlign: 'center' }}>{ingredient.quantity}</td>
                <td style={{ textAlign: 'center' }}>{ingredient.start}</td>
                <td style={{ textAlign: 'center' }}>{ingredient.end}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button variant="primary" onClick={this.props.onAdd} style={{backgroundColor: '#7851A9', color: "white"}}>Add Ingredient</Button>
      </div>
    );
  }
}

const ProfileButton = () => {
  const navigate = useNavigate();
  return (
    <div className="profile-button" style={{ position: 'absolute', top: '10px', right: '10px', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px' }}>
       <Button variant="primary" onClick={() => navigate('/profile')} style={{backgroundColor: '#7851A9', color: "white"}}>Profile</Button>
  </div>
  );
};

const Buttons = () => {
  const navigate = useNavigate();
  const buttonStyle = {
    fontSize: '24px',
    padding: '20px',
    marginBottom: '20px',
    width: '400px',
    height: '80px',
    boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
    backgroundColor: '#A9E2A9',
    color: "black",
  };
  const handleGenerateGroceries = () => {
    // Navigate to the groceries page
    navigate('/groceries');
  };

  return (
    <div className="buttons">
        <Button variant="success" block style={buttonStyle} onClick={() => navigate('/food-list')}> 
          Generate Meals
        </Button>
      <div style={{ marginTop: '20px' }}></div>
      <Button variant="info" block style={buttonStyle} onClick={handleGenerateGroceries}>
        Generate Groceries
      </Button>
    </div>
  );
};

const MainPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [expirationDate, setExpirationDate] = useState(today);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddIngredient = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleSaveIngredient = async () => {
    if (!name || !quantity) {
      alert("Please fill in Name and Quantity.");
      return;
    }
    const numQty = parseInt(quantity, 10);
    if (isNaN(numQty)) {
      alert("Quantity must be a valid number.");
      return;
    }

    try {
      const response = await fetch(apiUrl('/meals/addIngredient'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          quantity: numQty,
          start: startDate,
          end: expirationDate
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save ingredient');
      }
      setName('');
      setQuantity('');
      setStartDate(today);
      setExpirationDate(today);
      setShowAddModal(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Error adding ingredient:", error);
      alert("Failed to add ingredient: " + error.message);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <ProfileButton />
      <Container fluid className="d-flex align-items-center justify-content-center vh-100">
        <Row>
          <Col md={6} className="d-flex flex-column align-items-end" style={{ paddingRight: '5%' }}>
            <div style={{ width: '100%', marginRight: '5%' }}>
              <IngredientList key={refreshKey} onAdd={handleAddIngredient} />
            </div>
          </Col>
          <Col md={6} className="d-flex flex-column align-items-start" style={{ paddingLeft: '5%' }}>
            <Buttons />
            <UploadPicture /> {/* Add UploadPicture component here */}
          </Col>
        </Row>
      </Container>

      {/* Add Ingredient Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Ingredient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="ingredientName" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="ingredientQuantity" className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter quantity (e.g. 2)" 
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="ingredientStartDate" className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="ingredientExpirationDate" className="mb-3">
              <Form.Label>Expiration Date</Form.Label>
              <Form.Control 
                type="date" 
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveIngredient} style={{backgroundColor: '#7851A9', color: "white"}}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MainPage;