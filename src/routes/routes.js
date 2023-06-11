import express from 'express';
import userController from '../controllers/userController';
import adminController from '../controllers/adminController';
import appController from '../controllers/appController';

const router = express.Router();

const initWebRoutes = (app) => {
	router.post('/api/sign-up', userController.handleUserSignUp);
	router.post('/api/login', userController.handleUserLogin);

	router.post('/api/add-new-book', adminController.handleAddNewBook);
	router.put('/api/update-book-info', adminController.handleUpdateBookInfo);
	router.delete('/api/delete-book', adminController.handleDeleteBook);
	router.post('/api/add-new-chapter', adminController.handleAddNewChapter);
	router.put('/api/update-chapter-info', adminController.handleUpdateChapterInfo);

	router.get('/api/get-all-genre', appController.handleGetAllGenre);
	router.get('/api/get-all-kind', appController.handleGetAllKind);
	router.get('/api/get-all-code', appController.handleGetAllCode);
	router.get('/api/get-all-book', appController.handleGetAllBook);
	router.get('/api/get-all-new-book', appController.handleGetAllNewBook);
	router.get('/api/get-all-book-by-name', appController.handleGetAllBookByName);
	router.get('/api/get-all-book-by-genre', appController.handleGetAllBookByGenre);
	router.get('/api/get-book-info', appController.handleGetBookInfo);
	router.get('/api/get-all-chapter', appController.handleGetAllChapter);
	router.get('/api/get-chapter-info', appController.handleGetChapterInfo);

	return app.use('/', router);
};

module.exports = initWebRoutes;
