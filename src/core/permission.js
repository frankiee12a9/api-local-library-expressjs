import httpStatus from "http-status";
import ApiError from "../shared/api-error";
import { isArray, isEmpty } from "lodash";

export const hasAnyRole = (roles) => (req, res, next) => {
  const { userInfo } = req;
  let isAllowed = false;
  if (!isEmpty(userInfo)) {
    const {
      role: { roleCode, _id },
    } = userInfo;
    if (!isEmpty(roles)) {
      if (isArray(roles)) {
        isAllowed = roles.includes(roleCode);
      } else {
        isAllowed = roles === roleCode;
      }
    }
  }
  if (isAllowed) {
    next();
  } else {
    next(new ApiError("권한 없음", httpStatus.FORBIDDEN, true));
  }
};

export const PreAuthorize = () => (req, res, next) => {
  const { userInfo } = req;
  const {
    role: { roleCode, _id },
  } = userInfo;
  if (!isEmpty(userInfo)) {
    if (data.createdBy === userInfo.userNm) {
      next();
    } else {
      next(new ApiError("권한 없음", httpStatus.FORBIDDEN, true));
    }
  } else {
    next(new ApiError("권한 없음", httpStatus.FORBIDDEN, true));
  }
};

export const PostAuthorize = () => (req, res, next) => {
  const { userInfo } = req;
  const {
    role: { roleCode, _id },
  } = userInfo;
  if (!isEmpty(userInfo)) {
  } else {
    next(new ApiError("권한 없음", httpStatus.FORBIDDEN, true));
  }
};
