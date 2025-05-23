package org.example.role.controllers;

import org.example.role.model.User;
import org.example.role.repositories.RoleRepository;
import org.example.role.service.UserService;
import org.example.role.service.UserServiceImpl;
import org.springframework.security.access.prepost.PreAuthorize;
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
    public String adminHome(Model model) {
        model.addAttribute("list", userService.findAll());
        model.addAttribute("roles", roleRepository.findAll());
        return "admin/AllUsers";
    }

    @GetMapping("/new")
    public String addUser(Model model) {
        model.addAttribute("user", new User());
        model.addAttribute("allRoles", roleRepository.findAll());
        return "admin/new";
    }

    @PostMapping("/user")
    public String create(@ModelAttribute("user") User user, @RequestParam(value = "roleIds", required = false) List<Long> roleIds) {
        userService.save(user, roleIds);
        return "redirect:/admin/";
    }

    @GetMapping("/delete")
    public String deleteUser(Model model) {
        model.addAttribute("user", new User());
        return "admin/delete";
    }

    @PostMapping("/delete/{id}")
    public String delete(@PathVariable Long id) {
        userService.deleteById(id);
        return "redirect:/admin/";
    }

    @GetMapping("/update/{id}")
    public String updateUser(@PathVariable Long id, Model model) {
        User user = userService.findById(id);
        model.addAttribute("user", user);
        model.addAttribute("allRoles", roleRepository.findAll());
        return "admin/update";
    }

    @PostMapping("/update/{id}")
    public String update(@PathVariable Long id, @ModelAttribute("user") User user, @RequestParam(value = "roleIds", required = false) List<Long> roleIds) {
        userService.updateUserWithRoles(user, roleIds);
        return "redirect:/admin/";
    }
}