package org.example.role.service;

import org.example.role.model.Role;

public interface RoleService {
    Role findByName(String name);
}
