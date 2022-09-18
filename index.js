

const express = require ('express');
const app = express();

//set public static folder
app.use(express.static(__dirname+'/public')); 

//user view engine
let expressHbs = require('express-handlebars');
let helper = require('./controllers/helper');
let paginateHelper = require('express-handlebars-paginate');
let hbs = expressHbs.create({
    extname:'hbs',
    defaultLayout:'layouts',
    layoutsDir:__dirname+'/views/layouts/',
    partialsDir:__dirname + '/views/partials/',
    helpers:{
        createStarList: helper.createStarList,
        createStars: helper.createStars,
        createPagination: paginateHelper.createPagination
    },
    runtimeOptions: { allowProtoPropertiesByDefault: true },
});
app.engine('hbs',hbs.engine);
app.set('view engine','hbs');

//Body Parser
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//Use cookie-parser
let cookieParser = require('cookie-parser');
app.use(cookieParser());

//Use Session
let session = require('express-session');
app.use(session({
    cookie: { httpOnly:true,maxAge:null},
    secret:'Secret',
    resave:false,
    saveUninitialized:false
}));


//Use Cart Controller
let Cart = require('./controllers/cartController');
app.use((req,res,next)=>{
    var cart = new Cart(req.session.cart ? req.session.cart:{});
    req.session.cart =cart;
    res.locals.totalQuantity = cart.totalQuantity;

    res.locals.fullname =req.session.user ? req.session.user.fullname :'';
    res.locals.isLoggedIn =req.session.user ? true : false;
    next();
});

// define your route here
app.use('/',require('./routes/indexRouter'));
app.use('/products',require('./routes/productRouter'));

app.use('/cart',require('./routes/cartRouter'));
app.use('/comments',require('./routes/commentRouter'));

app.use('/reviews',require('./routes/reviewRouter'));
app.use('/users',require('./routes/userRouter'));
app.get('/sync',(req,res)=>{
    let models = require('./models');
    models.sequelize.sync()
    .then(()=>{
        res.send('Database completed successfully!');
    });
});

app.get('/:page', (req, res)=> {
    let banners = {
        blog: 'Our Blog',
        cart: 'Shopping Cart',
        category: 'Shop Category',
        checkout: 'Product Checkout',
        confirmation:'Order Confirmation',
        contact:'Contact Us',
        login:'Login / Register',
        register: 'Register',
        single_blog:'Blog Details',
        single_product:'Shop Single',
        tracking_order:'Order Tracking'
    };
    let page = req.params.page;
    res.render(page,{banner:banners[page]});
});

app.set ('port', process.env.PORT || 34567);
app.listen (app.get('port'), ()=>{
    console.log(`Server running at port ${app.get('port')}`);
});