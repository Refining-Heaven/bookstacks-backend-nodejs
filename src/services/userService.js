import db from '../models';
import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);

const hashPassword = async (password) => {
	try {
		const hashPassword = await bcrypt.hashSync(password, salt);
		return hashPassword;
	} catch (e) {
		console.log(e);
	}
};

const checkUserEmail = async (userEmail) => {
	try {
		const user = await db.User.findOne({
			where: { email: userEmail },
		});
		if (user) {
			return true;
		} else {
			return false;
		}
	} catch (e) {
		console.log(e);
	}
};

// Services
const userSignUpService = async (data) => {
	try {
		if (!data.email || !data.username || !data.password) {
			return {
				errCode: 2,
				errMessage: 'Missing input parameters!',
			};
		} else {
			const checkEmail = await checkUserEmail(data.email);
			if (checkEmail === true) {
				return {
					errCode: 1,
					errMessage: 'Your email is already in use!',
				};
			} else {
				const hashPasswordFromBycrypt = await hashPassword(data.password);
				await db.User.create({
					email: data.email,
					username: data.username,
					password: hashPasswordFromBycrypt,
				});
				return {
					errCode: 0,
					errMessage: 'Sign up succeed, please login!',
				};
			}
		}
	} catch (e) {
		console.log(e);
		return {
			errCode: -1,
			errMessage: 'Error from server!',
		};
	}
};

const userLoginService = async (data) => {
	try {
		if (!data.email || !data.password) {
			return {
				errCode: 5,
				errMessage: 'Missing inputs parameters!',
			};
		} else {
			const isExist = await checkUserEmail(data.email);
			if (isExist) {
				const user = await db.User.findOne({
					where: { email: data.email },
					attributes: {
						exclude: ['avatar', 'createdAt', 'updatedAt'],
					},
					raw: true,
				});
				if (user) {
					if (!!user.banned === true) {
						return {
							errCode: 2,
							errMessage: 'This account has been banned!',
						};
					} else {
						const check = await bcrypt.compareSync(data.password, user.password);
						if (check) {
							delete user.password;
							return {
								errCode: 0,
								errMessage: 'Login succeed!',
								data: user,
							};
						} else {
							return {
								errCode: 1,
								errMessage: 'Wrong password!',
							};
						}
					}
				} else {
					return {
						errCode: 3,
						errMessage: 'User not found!',
					};
				}
			} else {
				return {
					errCode: 4,
					errMessage: `Your Email isn't exist in our system!`,
				};
			}
		}
	} catch (e) {
		console.log(e);
		return {
			errCode: -1,
			errMessage: 'Error from server',
		};
	}
};

const getAccountInfoService = async (userId) => {
	try {
		if (userId) {
			const userInfo = await db.User.findOne({
				where: { id: userId },
				attributes: {
					exclude: ['password', 'createdAt', 'updatedAt'],
				},
				include: [{ model: db.Allcode, as: 'roleData', attributes: ['valueEn', 'valueVi'] }],
				raw: true,
				nest: true,
			});
			if (!userInfo) {
				return {
					errCode: 1,
					errMessage: `User isn't exist`,
				};
			} else {
				return {
					errCode: 0,
					errMessage: 'Ok',
					data: userInfo,
				};
			}
		} else {
			return {
				errCode: 2,
				errMessage: 'Missing required parameters',
			};
		}
	} catch (e) {
		console.log(e);
		return {
			errCode: -1,
			errMessage: 'Error from server',
		};
	}
};

const updateAccountInfoService = async (data) => {
	try {
		if (!data.userId) {
			return {
				errCode: 1,
				errMessage: 'Missing input Parameters!',
			};
		} else {
			let account = await db.User.findOne({
				where: { id: data.userId },
				raw: false,
			});
			if (account) {
				account.set({
					email: data.email,
					username: data.username,
				});
				if (data.avatar) {
					account.set({
						avatar: data.avatar,
					});
				}
				await account.save();
				return {
					errCode: 0,
					errMessage: 'Update account info succeed!',
				};
			} else {
				return {
					errCode: 1,
					errMessage: 'Account not found',
				};
			}
		}
	} catch (e) {
		console.log(e);
		return {
			errCode: -1,
			errMessage: 'Error from server',
		};
	}
};

const changePasswordService = async (data) => {
	try {
		if (!data.userId) {
			return {
				errCode: 5,
				errMessage: 'Missing input Parameters!',
			};
		} else {
			let account = await db.User.findOne({
				where: { id: data.userId },
				raw: false,
			});
			if (account) {
				const checkCurrentPassword = await bcrypt.compareSync(data.currentPassword, account.password);
				if (checkCurrentPassword) {
					if (data.newPassword !== '') {
						if (data.newPassword === data.confirmNewPassword) {
							const hashPasswordFromBycrypt = await hashPassword(data.newPassword);
							account.set({
								password: hashPasswordFromBycrypt,
							});
							await account.save();
							return {
								errCode: 0,
								errMessage: 'Change account password succeed!',
							};
						} else {
							return {
								errCode: 1,
								errMessage: `Confirm new password doesn't match with new password!`,
							};
						}
					} else {
						return {
							errCode: 2,
							errMessage: 'Please enter new password!',
						};
					}
				} else {
					return {
						errCode: 3,
						errMessage: 'Current password is wrong!',
					};
				}
			} else {
				return {
					errCode: 4,
					errMessage: 'Account not found',
				};
			}
		}
	} catch (e) {
		console.log(e);
		return {
			errCode: -1,
			errMessage: 'Error from server',
		};
	}
};

const addCommentService = async (data) => {
	try {
		if (!data.userId) {
			return {
				errCode: 1,
				errMessage: 'You must login to comment!',
			};
		} else {
			if (!data.type) {
				return {
					errCode: 2,
					errMessage: 'Missing required parameters',
				};
			} else {
				if (data.content === '') {
					return {
						errCode: 3,
						errMessage: 'Please enter comment!',
					};
				} else {
					if (data.type === 'BOOK') {
						await db.Comment.create({
							content: data.content,
							userId: data.userId,
							bookId: data.bookId,
						});
					}
					if (data.type === 'CHAPTER') {
						await db.Comment.create({
							content: data.content,
							userId: data.userId,
							bookId: data.bookId,
							chapterId: data.chapterId,
						});
					}
					return {
						errCode: 0,
						errMessage: 'Ok',
					};
				}
			}
		}
	} catch (e) {
		console.log(e);
		return {
			errCode: -1,
			errMessage: 'Error from server',
		};
	}
};

const addReplyService = async (data) => {
	try {
		if (!data.userId) {
			return {
				errCode: 1,
				errMessage: 'You must login to reply!',
			};
		} else {
			if (!data.commentId) {
				return {
					errCode: 2,
					errMessage: 'Missing required parameters',
				};
			} else {
				if (data.content === '') {
					return {
						errCode: 3,
						errMessage: 'Please enter reply!',
					};
				} else {
					await db.Reply.create({
						content: data.content,
						userId: data.userId,
						commentId: data.commentId,
					});
					return {
						errCode: 0,
						errMessage: 'Ok',
					};
				}
			}
		}
	} catch (e) {
		console.log(e);
		return {
			errCode: -1,
			errMessage: 'Error from server',
		};
	}
};

const deleteCommentService = async (id, type) => {
	try {
		if (!id || !type) {
			return {
				errCode: 2,
				errMessage: 'Missing required parameters',
			};
		} else {
			if (type === 'COMMENT') {
				const comment = await db.Comment.findOne({
					where: { id: id },
					raw: false
				});
				await db.Reply.destroy({where: { commentId: id }});
				await comment.destroy();
				return {
					errCode: 0,
					data: 'Ok',
				};
			}
		}
		if (type === 'REPLY') {
			const reply = await db.Reply.findOne({
				where: { id: id },
				raw: false
			});
			await reply.destroy();
			return {
				errCode: 0,
				data: 'Ok',
			};
		}
	} catch (e) {
		console.log(e);
		return {
			errCode: -1,
			errMessage: 'Error from server',
		};
	}
};

module.exports = {
	userSignUpService,
	userLoginService,
	getAccountInfoService,
	updateAccountInfoService,
	changePasswordService,
	addCommentService,
	addReplyService,
	deleteCommentService,
};
