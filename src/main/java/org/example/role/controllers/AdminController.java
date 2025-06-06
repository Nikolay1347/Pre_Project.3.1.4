package org.example.role.controllers;

import org.example.role.model.User;
import org.example.role.repositories.RoleRepository;
import org.example.role.service.UserService;
import org.example.role.service.UserServiceImpl;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final UserService userService;
    private final RoleRepository roleRepository;

    public AdminController(UserService userService, RoleRepository roleRepository) {
        this.userService = userService;
        this.roleRepository = roleRepository;
    }

    @GetMapping("/")
    public String adminHome(@AuthenticationPrincipal User userAdmin, Model model) {
        model.addAttribute("list", userService.findAll());
        model.addAttribute("roles", roleRepository.findAll());
        model.addAttribute("user", new User());
        model.addAttribute("userAdmin", userAdmin);
        model.addAttribute("allRoles", roleRepository.findAll());
        //return "admin/Table";
        return "admin/Admin panel";
    }

    @PostMapping("/user")
    public String create(@ModelAttribute("user") User user, @RequestParam(value = "roleIds", required = false) List<Long> roleIds) {
        userService.save(user, roleIds);
        return "redirect:/admin/";
    }

    @PostMapping("/delete/{id}")
    public String delete(@PathVariable Long id) {
        userService.deleteById(id);
        return "redirect:/admin/";
    }

    @PostMapping("/update")
    public String update(@ModelAttribute("item") User updateUser, @RequestParam(value = "role", required = false) List<Long> role) {
        userService.updateUserWithRoles(updateUser, role);
        return "redirect:/admin/";
    }
}