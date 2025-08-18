package org.example.role.service;

import org.example.role.model.User;

import java.util.Collection;
import java.util.List;

public interface UserService {
    void deleteById(Long id);

    void save(User user);

    User findById(Long id);

    List<User> findAll();
}
